#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;
use discord_rich_presence::{activity::{Activity, Assets, Button, Timestamps}, DiscordIpcClient, DiscordIpc};
use chrono::prelude::Utc;

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }

  window.get_window("main").unwrap().show().unwrap();
}

#[tauri::command]
fn get_api_url() -> String {
  env!("API_URL").to_string()
}

#[tauri::command]
fn get_voice_url() -> String {
  env!("VOICE_URL").to_string()
}

fn main() -> Result<(), Box<(dyn std::error::Error)>> {
  let client_id = env!("DISCORD_APP_ID").to_string();

  let mut client = DiscordIpcClient::new(&client_id)?;
  client.connect()?;

  let url = format!("https://google.com");
  let now = Utc::now();
  let ts: i64 = now.timestamp();

  let payload = Activity::new()
    .timestamps(
        Timestamps::new()
            .start(ts)
    )
    .assets(
        Assets::new()
            .large_image("krater-cord")
            .large_text("kazakhstan ugrazaj nambambierofke")
    )
    .buttons(
        vec![
            Button::new("Download", &url)
        ]
    )
    ;

  client.set_activity(payload)?;

  let quit = CustomMenuItem::new("quit".to_string(), "Quit kraterCord");

  let tray_menu = SystemTrayMenu::new()
    .add_item(quit);
  let system_tray = SystemTray::new()
    .with_menu(tray_menu);

  tauri::Builder::default()
    .system_tray(system_tray)
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::LeftClick {
        position: _,
        size: _,
        ..
      } => {
        let window = app.get_window("main").unwrap();
        window.show().unwrap();
      }
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          _ => {}
        }
      }
      _ => {}
    })
    .invoke_handler(tauri::generate_handler![get_api_url, close_splashscreen, get_voice_url])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

    Ok(())
}
