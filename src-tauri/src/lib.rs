use std::path::PathBuf;

use image::{ImageBuffer, Rgba};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use windows::{
    core::{BOOL, Result as WinResult},
    Win32::{
        Foundation::{HWND, LPARAM, RECT},
        Graphics::Gdi::{
            BitBlt, CreateCompatibleBitmap, CreateCompatibleDC, DeleteDC, DeleteObject, GetDC,
            GetDIBits, ReleaseDC, SelectObject, BITMAPINFO, BITMAPINFOHEADER, BI_RGB,
            CAPTUREBLT, DIB_RGB_COLORS, HBITMAP, SRCCOPY,
        },
        UI::WindowsAndMessaging::{
            EnumWindows, GetShellWindow, GetSystemMetrics, GetWindowRect, GetWindowTextLengthW,
            GetWindowTextW, IsIconic, IsWindowVisible, SM_CXSCREEN, SM_CYSCREEN,
        },
    },
};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CaptureResult {
    pub path: String,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CaptureWindow {
    pub handle: isize,
    pub title: String,
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordingCapability {
    pub available: bool,
    pub message: String,
}

struct ScreenDc(windows::Win32::Graphics::Gdi::HDC);
impl Drop for ScreenDc {
    fn drop(&mut self) {
        unsafe { let _ = ReleaseDC(None, self.0); }
    }
}

struct CompatibleDc(windows::Win32::Graphics::Gdi::HDC);
impl Drop for CompatibleDc {
    fn drop(&mut self) {
        unsafe { let _ = DeleteDC(self.0); }
    }
}

struct OwnedBitmap(HBITMAP);
impl Drop for OwnedBitmap {
    fn drop(&mut self) {
        unsafe { let _ = DeleteObject(self.0.into()); }
    }
}

fn capture_pixels(x: i32, y: i32, width: i32, height: i32) -> WinResult<(Vec<u8>, i32, i32)> {
    unsafe {
        if width <= 0 || height <= 0 {
            return Err(windows::core::Error::new(windows::core::HRESULT(0x80004005u32 as i32), "Capture dimensions must be positive"));
        }

        let screen = ScreenDc(GetDC(None));
        let memory = CompatibleDc(CreateCompatibleDC(Some(screen.0)));
        let bitmap = OwnedBitmap(CreateCompatibleBitmap(screen.0, width, height));
        let old = SelectObject(memory.0, bitmap.0.into());
        BitBlt(memory.0, 0, 0, width, height, Some(screen.0), x, y, SRCCOPY | CAPTUREBLT)?;

        let mut info = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: width,
                biHeight: -height,
                biPlanes: 1,
                biBitCount: 32,
                biCompression: BI_RGB.0,
                ..Default::default()
            },
            ..Default::default()
        };
        let mut bgra = vec![0u8; width as usize * height as usize * 4];
        let lines = GetDIBits(memory.0, bitmap.0, 0, height as u32, Some(bgra.as_mut_ptr().cast()), &mut info, DIB_RGB_COLORS);
        let _ = SelectObject(memory.0, old);
        if lines == 0 {
            return Err(windows::core::Error::from_hresult(windows::core::HRESULT(0x80004005u32 as i32)));
        }
        Ok((bgra, width, height))
    }
}

fn capture_primary_display() -> WinResult<(Vec<u8>, i32, i32)> {
    let width = unsafe { GetSystemMetrics(SM_CXSCREEN) };
    let height = unsafe { GetSystemMetrics(SM_CYSCREEN) };
    capture_pixels(0, 0, width, height)
}

unsafe extern "system" fn collect_window(hwnd: HWND, lparam: LPARAM) -> BOOL {
    if !IsWindowVisible(hwnd).as_bool() || IsIconic(hwnd).as_bool() || hwnd == GetShellWindow() {
        return BOOL(1);
    }
    let title_length = GetWindowTextLengthW(hwnd);
    if title_length <= 0 {
        return BOOL(1);
    }
    let mut rect = RECT::default();
    if GetWindowRect(hwnd, &mut rect).is_err() {
        return BOOL(1);
    }
    let width = rect.right - rect.left;
    let height = rect.bottom - rect.top;
    if width < 80 || height < 60 {
        return BOOL(1);
    }
    let mut buffer = vec![0u16; title_length as usize + 1];
    let copied = GetWindowTextW(hwnd, &mut buffer);
    if copied <= 0 {
        return BOOL(1);
    }
    let title = String::from_utf16_lossy(&buffer[..copied as usize]);
    let windows = &mut *(lparam.0 as *mut Vec<CaptureWindow>);
    windows.push(CaptureWindow { handle: hwnd.0 as isize, title, x: rect.left, y: rect.top, width, height });
    BOOL(1)
}

fn list_windows() -> Result<Vec<CaptureWindow>, String> {
    let mut windows: Vec<CaptureWindow> = Vec::new();
    unsafe {
        EnumWindows(Some(collect_window), LPARAM((&mut windows as *mut Vec<CaptureWindow>) as isize))
            .map_err(|error| error.to_string())?;
    }
    windows.sort_by(|left, right| left.title.to_lowercase().cmp(&right.title.to_lowercase()));
    Ok(windows)
}

fn captures_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let base = app.path().picture_dir().map_err(|error| error.to_string())
        .or_else(|_| app.path().app_data_dir().map_err(|error| error.to_string()))?;
    let target = base.join("SnipRecord").join("captures");
    std::fs::create_dir_all(&target).map_err(|error| error.to_string())?;
    Ok(target)
}

fn save_capture(app: &AppHandle, bgra: Vec<u8>, width: i32, height: i32) -> Result<CaptureResult, String> {
    let mut rgba = Vec::with_capacity(bgra.len());
    for pixel in bgra.chunks_exact(4) {
        rgba.extend_from_slice(&[pixel[2], pixel[1], pixel[0], pixel[3]]);
    }
    let image = ImageBuffer::<Rgba<u8>, _>::from_raw(width as u32, height as u32, rgba)
        .ok_or_else(|| "Failed to convert captured pixels".to_string())?;
    let timestamp = chrono_like_timestamp();
    let path = captures_dir(app)?.join(format!("snip-{timestamp}.png"));
    image.save(&path).map_err(|error| error.to_string())?;
    Ok(CaptureResult { path: path.to_string_lossy().to_string(), width, height })
}

#[tauri::command]
fn capture_screen(app: AppHandle) -> Result<CaptureResult, String> {
    let (bgra, width, height) = capture_primary_display().map_err(|error| error.to_string())?;
    save_capture(&app, bgra, width, height)
}

#[tauri::command]
fn capture_region(app: AppHandle, x: i32, y: i32, width: i32, height: i32) -> Result<CaptureResult, String> {
    if width < 2 || height < 2 {
        return Err("Select an area at least 2 × 2 pixels.".into());
    }
    let (bgra, width, height) = capture_pixels(x, y, width, height).map_err(|error| error.to_string())?;
    save_capture(&app, bgra, width, height)
}

#[tauri::command]
fn copy_capture_to_clipboard(path: String) -> Result<(), String> {
    let decoded = image::open(&path).map_err(|error| error.to_string())?.to_rgba8();
    let (width, height) = decoded.dimensions();
    let image_data = arboard::ImageData {
        width: width as usize,
        height: height as usize,
        bytes: std::borrow::Cow::Owned(decoded.into_raw()),
    };
    let mut clipboard = arboard::Clipboard::new().map_err(|error| error.to_string())?;
    clipboard.set_image(image_data).map_err(|error| error.to_string())
}

#[tauri::command]
fn list_capture_windows() -> Result<Vec<CaptureWindow>, String> {
    list_windows()
}

#[tauri::command]
fn capture_window(app: AppHandle, window: CaptureWindow) -> Result<CaptureResult, String> {
    if window.width < 2 || window.height < 2 {
        return Err("The selected window has an invalid size.".into());
    }
    let (bgra, width, height) = capture_pixels(window.x, window.y, window.width, window.height)
        .map_err(|error| error.to_string())?;
    save_capture(&app, bgra, width, height)
}

#[tauri::command]
fn recording_capability() -> RecordingCapability {
    RecordingCapability {
        available: false,
        message: "Screen recording and WASAPI system audio are the next native milestone. This build supports real screenshot capture only.".into(),
    }
}

fn chrono_like_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis().to_string()
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            capture_screen,
            capture_region,
            copy_capture_to_clipboard,
            list_capture_windows,
            capture_window,
            recording_capability
        ])
        .run(tauri::generate_context!())
        .expect("error while running SnipRecord");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn recording_is_honestly_reported_as_unavailable() {
        assert!(!recording_capability().available);
    }

    #[test]
    fn capture_rejects_invalid_dimensions() {
        assert!(capture_pixels(0, 0, 0, 100).is_err());
        assert!(capture_pixels(0, 0, 100, 0).is_err());
    }
}
