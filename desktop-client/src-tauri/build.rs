fn main() {
  tauri_build::build();
  
  dotenv_build::output(dotenv_build::Config::default()).unwrap();
}
