import axios, { AxiosError } from "axios";
import { user } from "../store/user";
import { infQueryData, member, message, _data } from "./types";
import { invoke } from "@tauri-apps/api/tauri";

let API_URL: string = 'http://localhost:3001/api';

// invoke("get_api_url").then((url) => API_URL = url as string);

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;

export const isAuthenticated = async () => {
    const res = await axios.get(`/auth/check`);

    if (res.data.msg === "Authorized") {
        return true;
    }

    return false;
};

export const fetchOnLoad = async () => {
    const res = await axios.get(`/auth/setup`);

    return res.data;
}

export const fetchMessages = async (id: string, page: number) => {
    try {
        const response = await axios.get<infQueryData>(`/channels/messages/${id}?_skip=${20 * page}&_limit=20`);

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
        const response = await axios.post<message>(`/channels/${id}/message`, {
            author: author._id,
            content,
            media
        });

        return response.data;
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

export const sendFriendRequest = async (id: string, username: string, hash: string) => {
    try {
        const response = await axios.post<user>(`/user/friend/request`, {
            username,
            hash,
            id
        });

        return response;
    } catch (err: any) {
        console.log(err);

        if (err.name === "AxiosError") return err.response;

        return undefined;
    }
}

export const handleFriend = async (id: string, friendId: string, type: string) => {
    try {
        const response = await axios.post(`/user/friend/${type}`, { id, friendId });

        return response;
    } catch (err: any) {
        console.log(err);

        if (err.name === "AxiosError") return err.response;

        return { data: undefined };
    }
}

export const createChannel = async (users: string[], type: string) => {
    try {
        const response = await axios.post(`/channels/create/${type}`, { users });

        return response;
    } catch (err: any) {
        console.log(err);

        if (err.name === "AxiosError") return err.response;

        return { data: undefined };
    }
}

export const uploadFile = async (data: FormData) : Promise<string | undefined> => {
    try {
        const response = await axios.post(`/upload`, data);

        return response.data.url;
    } catch (err: any) {
        console.log(err);

        return undefined;
    }
}

export const updateUserApi = async (id: string, username: string, avatar: string) : Promise<member | undefined> => {
    try {
        console.log(username, avatar);

        const response = await axios.post('/user/update', { username, avatar, id });

        console.log(response);

        return response.data.user;
    } catch(err) {
        console.log(err);

        return undefined;
    }
}