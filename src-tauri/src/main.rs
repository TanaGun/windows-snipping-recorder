#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    windows_snipping_recorder_lib::run();
}
