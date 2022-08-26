import axios, { AxiosError } from "axios";
import { user } from "../store/user";
import { infQueryData, member, message, _data } from "./types";
import { invoke } from "@tauri-apps/api/tauri";

invoke("get_api_url").then((url) => axios.defaults.baseURL = url as string);
axios.defaults.withCredentials = true;

axios.interceptors.response.use((res) => {
    return res;
}, (err: AxiosError) => {
    if (err.response?.status !== 403 && err.response?.status !== 401) return Promise.reject(err);

    window.location.href = '/';

    return Promise.reject(err);
});

export const fetchOnLoad = async () => {
    try {
        const res = await axios.get(`/auth/setup`);

        return res.data;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const fetchMessages = async (id: string, page: number) => {
    try {
        const response = await axios.get<infQueryData>(`/channels/messages/${id}?_skip=${20 * page}&_limit=20`);

        return response.data;
    } catch (err) {
        console.error(err);
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
        console.error(err);
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
        console.error(err);

        if (err.name === "AxiosError") return err.response;

        return undefined;
    }
}

export const handleFriend = async (id: string, friendId: string, type: string) => {
    try {
        const response = await axios.post(`/user/friend/${type}`, { id, friendId });

        return response;
    } catch (err: any) {
        console.error(err);

        if (err.name === "AxiosError") return err.response;

        return { data: undefined };
    }
}

export const createChannel = async (users: { user: string; }[], type: string) => {
    try {
        const response = await axios.post(`/channels/create/${type}`, { users });

        return response;
    } catch (err: any) {
        console.error(err);

        if (err.name === "AxiosError") return err.response;

        return { data: undefined };
    }
}

export const uploadFile = async (data: FormData) : Promise<string | undefined> => {
    try {
        const response = await axios.post(`/upload`, data);

        return response.data.url;
    } catch (err: any) {
        console.error(err);

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
        console.error(err);

        return undefined;
    }
}

export const logout = async () => {
    try {
        const response = await axios.get('/auth/logout');

        return response;
    } catch(err) {
        console.error(err);

        return undefined;
    }
}