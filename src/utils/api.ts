import axios, { AxiosError } from "axios";
import { user } from "../store/user";
import { infQueryData, message, _data } from "./types";
import { invoke } from "@tauri-apps/api/tauri";

let API_URL: string;

invoke("get_api_url").then((url) => API_URL = url as string);

export const isAuthenticated = async () => {
    const res = await axios.get(`${API_URL}/auth/check`, { withCredentials: true });

    if (res.data.msg === "Authorized") {
        return true;
    }

    return false;
};

export const fetchOnLoad = async () => {
    const res = await axios.get(`${API_URL}/auth/setup`, { withCredentials: true });

    return res.data;
}

export const fetchMessages = async (id: string, page: number) => {
    try {
        const response = await axios.get<infQueryData>(`${API_URL}/channels/messages/${id}?_skip=${20 * page}&_limit=20`, { withCredentials: true });

        return response.data;
    } catch (err) {
        console.log(err);
        return { messages: [], nextId: 0 };
    }
}

export const createMessage = async (data: _data) => {
    const { id, msg } = data;
    const { content, media, author } = msg;

    try {
        const response = await axios.post<message>(`${API_URL}/channels/${id}/message`, {
            author,
            content,
            media
        }, { withCredentials: true });

        return response.data;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

export const sendFriendRequest = async (id: string, username: string, hash: string) => {
    try {
        const response = await axios.post<user>(`${API_URL}/user/friend/request`, {
            username,
            hash,
            id
        }, { withCredentials: true });

        return response;
    } catch (err: any) {
        console.log(err);

        if (err.name === "AxiosError") return err.response;

        return undefined;
    }
}

export const handleFriend = async (id: string, friendId: string, type: string) => {
    try {
        const response = await axios.post(`${API_URL}/user/friend/${type}`, { id, friendId }, { withCredentials: true });

        return response;
    } catch (err: any) {
        console.log(err);

        if (err.name === "AxiosError") return err.response;

        return { data: undefined };
    }
}

export const createChannel = async (users: string[], type: string) => {
    try {
        const response = await axios.post(`${API_URL}/channels/create/${type}`, { users }, { withCredentials: true });

        return response;
    } catch (err: any) {
        console.log(err);

        if (err.name === "AxiosError") return err.response;

        return { data: undefined };
    }
}