import { invoke } from "@tauri-apps/api"

export const getApiURL = async () => {
    const url = await invoke("get_api_url");

    return url;
}