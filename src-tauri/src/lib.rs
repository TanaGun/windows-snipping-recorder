//! Native Windows integration contract.
//!
//! The React prototype is intentionally runnable without native prerequisites.
//! When the Tauri shell is enabled, this module is the boundary for Windows
//! Graphics Capture and WASAPI loopback. No capture/audio implementation is
//! stubbed as working here.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CaptureSource {
    Region,
    Window,
    Display,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RecordingAudioSource {
    SystemAudio,
    Microphone,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RecordingRequest {
    pub source: CaptureSource,
    pub system_audio: bool,
    pub microphone: bool,
}

/// Documents the native implementation boundary.
///
/// Production implementation requirements:
/// - Windows Graphics Capture for display/window frames.
/// - WASAPI loopback for system output audio.
/// - Timestamped audio/video muxing through an encoder such as FFmpeg.
/// - Explicit errors for protected content, unavailable devices, and permission
///   failures. The app must not attempt to bypass OS or DRM protections.
pub fn native_capabilities() -> &'static [&'static str] {
    &[
        "Windows Graphics Capture (planned)",
        "WASAPI loopback system audio (planned)",
        "Microphone mix and A/V sync (planned)",
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn exposes_system_audio_in_the_native_contract() {
        let request = RecordingRequest {
            source: CaptureSource::Region,
            system_audio: true,
            microphone: true,
        };
        assert!(request.system_audio);
        assert!(request.microphone);
        assert!(native_capabilities()
            .iter()
            .any(|capability| capability.contains("WASAPI")));
    }
}
