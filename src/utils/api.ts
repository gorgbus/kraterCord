import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { validateCookies } from "./helpers";
import { channel, guild, infQueryData, member, message, notif } from "./types";
import FormData from 'form-data';
import { API_URl } from "./constants";

type data = {
    id: string;
    msg: {
        content: string;
        media: {
            link: string;
            type: string;
        }
        author: string;
    };
}

interface setup {
    guilds: guild[];
    channels: channel[];
    member: member;
    dms: channel[];
    notifs: notif[];
    users: member[];
}

export const fetchGuildChannels = async (guildId: string) => {
    if (!guildId) return [];

    try {
        const response = await axios.get(`${API_URl}/channels/${guildId}`, { withCredentials: true });

        return response.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const fetchOnStart = async (ctx: GetServerSidePropsContext) => {
    const headers = validateCookies(ctx);

    if (!headers) return { redirect: { destination: "/" } };

    try {
        const { data: { member, guilds, channels, dms, notifs, users } } = await axios.get<setup>(`${API_URl}/auth/setup`, { headers });
        
        return { props: { member, guilds, channels, dms, notifs, users } };
    } catch (err) {
        console.log(err);
        return { redirect: { destination: "/" } };
    }
}

export const fetchMessages = async (id: string, page: number) => {
    try {
        const response = await axios.get<infQueryData>(`${API_URl}/channels/messages/${id}?_skip=${20 * page}&_limit=20`, { withCredentials: true });

        return response.data;
    } catch (err) {
        console.log(err);
        return { messages: [], nextId: 0 };
    }
}

export const createMessage = async (data: data) => {
    const { id, msg } = data;
    const { content, media, author } = msg;

    try {
        const response = await axios.post<message>(`${API_URl}/channels/${id}/message`, {
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

export const uploadFile = async (data: FormData) => {
    const response = await axios.post(`${API_URl}/upload`, data, { withCredentials: true });

    return response.data.url;
}

export const sendFriendRequest = async (content: string, id: string) => {
    if (content.length <= 5) return { status: 500 };

    const username = content.slice(0, content.length - 5);
    const hash = content.slice(content.length - 4, content.length);

    try {
        const response = await axios.post(`${API_URl}/user/friend_request`, { username, hash, id }, { withCredentials: true });

        return { status: response.status, data: response.data };
    } catch (err) {
        console.log(err);
        return { status: 500 };
    }
}

export const acceptFriendRequest = async (id: string, friendId: string) => {
    try {
        const response = await axios.post(`${API_URl}/user/friend_accept`, { id, friendId }, { withCredentials: true });

        return response;
    } catch (err) {
        console.log(err);
        return { data: undefined };
    }
}

export const rejectFriendRequest = async (id: string, friendId: string) => {
    try {
        const response = await axios.post(`${API_URl}/user/friend_decline`, { id, friendId }, { withCredentials: true });

        return response;
    } catch (err) {
        console.log(err);
        return { data: undefined };
    }
}

export const removeFriend = async (id: string, friendId: string) => {
    try {
        const response = await axios.post(`${API_URl}/user/friend_remove`, { id, friendId }, { withCredentials: true });

        return response;
    } catch (err) {
        console.log(err);
        return { data: undefined };
    }
}

export const createChannel = async (users: string[], type: string) => {
    try {
        const response = await axios.post(`${API_URl}/channels/create/${type}`, { users }, { withCredentials: true });

        return response;
    } catch (err) {
        console.log(err);
        return { data: undefined };
    }
}