import axios, { AxiosError } from "axios";
import { Channel, ChannelType, FriendsRequest, Guild, Member, Message, Notification, updatedPropertiesType, User } from "./types";
import { getApiURL } from "@kratercord/desktop-client/src/utils";

(process.env.NEXT_PUBLIC_API_URL) ?
    axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api`
:
    getApiURL().then(url => axios.defaults.baseURL = `${url}/api`);
axios.defaults.withCredentials = true;

axios.interceptors.response.use((res) => {
    return res;
}, (err: AxiosError) => {
    if (err.response?.status !== 403 && err.response?.status !== 401) return Promise.reject(err);

    window.location.href = '/';

    return Promise.reject(err);
});

type returnType<T> = Promise<T | undefined>;

export const fetchOnLoad = async () : returnType<User> => {
    try {
        const res = await axios.get(`/auth/setup`);

        return res.data.user;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const fetchMessages = async (id: string, cursor: string) : Promise<{ messages: Message[]; nextId: string }> => {
    try {
        const response = await axios.get(`/channels/messages/${id}?cursor=${cursor}`);

        return response.data;
    } catch (err) {
        console.error(err);

        return { messages: [], nextId: 'undefined' };
    }
}

export const fetchChannels = async (guild: string) : returnType<Channel[]> => {
    try {
        const response = await axios.get(`/channels/${guild}`);

        return response.data.channels;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const fetchMembers = async (guild: string) : returnType<Member[]> => {
    try {
        const response = await axios.get(`/guilds/${guild}/members`);

        return response.data.members;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const getGuildInvite = async (guild: string) : returnType<string> => {
    try {
        const response = await axios.get(`/guilds/${guild}/invite`);

        return response.data.invite;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const createMessage = async ({ channelId, guildId, content } : { channelId: string; guildId?: string; content: string; member?: Member; author?: { id: string; avatar: string; username: string; } }) : returnType<Message> => {
    try {
        const response = await axios.post(`/channels/${channelId}/message`, {
            guildId,
            content,
        });

        return response.data.message;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const sendFriendRequest = async (id: string, username: string, hash: string) : returnType<{ msg: string; request: FriendsRequest; user?: User; friend?: User; requestId?: string; } | undefined> => {
    try {
        const response = await axios.post(`/user/friend/request`, {
            username,
            hash,
            id
        });

        return { request: response.data.request, msg: response.data.msg, friend: response.data.friend, requestId: response.data.requestId };
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const declineFriend = async (requestId: string) : returnType<string | undefined> => {
    try {
        const response = await axios.post('/user/friend/decline', { id: requestId });

        return response.data.requestId;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const removeFriendApi = async (userId: string, friendId: string) : returnType<string | undefined> => {
    try {
        const response = await axios.post('/user/friend/remove', { userId, friendId });

        return response.data.friendId;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const acceptFriend = async (requestId: string, userId: string, friendId: string) : returnType<{ friend: User; requestId: string; user: User; } | undefined> => {
    try {
        const response = await axios.post('/user/friend/accept', { requestId, userId, friendId });

        return response.data;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const createChannel = async (userIds: { id: string; }[], type: ChannelType, name: string) : returnType<Channel | undefined> => {
    try {
        const response = await axios.post(`/channels/create/${type}`, { userIds, name });

        return response.data.channel;
    } catch (err: any) {
        console.error(err);

        return undefined;
    }
}

export const joinChannel = async ({ channelId, muted, deafen, member } : { guildId: string; channelId: string; muted: boolean; deafen: boolean; member?: Member; }) : returnType<Channel> => {
    try {
        const response = await axios.post(`/channels/${channelId}/join`, { muted, deafen, memberId: member?.id });

        return response.data.channel;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const updateVoiceState = async ({ muted, deafen, memberId } : { muted: boolean; deafen: boolean; guildId: string; channelId: string, memberId: string }) : returnType<Member> => {
    try {
        const response = await axios.post('/channels/member/update', { muted, deafen, memberId });

        return response.data.member;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const leaveChannel = async ({ channelId, memberId } : { guildId: string; channelId: string; memberId: string; }) : returnType<Channel> => {
    try {
        const response = await axios.post(`/channels/${channelId}/leave`, { memberId });

        return response.data.channel;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const createGuild = async (formData: FormData) : returnType<Guild> => {
    try {
        const response = await axios.post('/guilds/create', formData);

        return response.data.guild;
    } catch (err) {
        console.error(err);

        return undefined
    }
}

export const joinGuild = async (code: string, userId: string) : returnType<Guild> => {
    try {
        const response = await axios.post(`/guilds/join/${code}`, {
            userId
        });

        return response.data.guild;
    } catch (err) {
        console.error(err);

        return undefined
    }
}

export const createNotfication = async (channelId: string, guildId?: string) : returnType<Notification> => {
    try {
        const response = await axios.post('/user/notification/create', { channelId, guildId });

        return response.data;
    } catch (err) {
        console.error(err);

        return undefined;
    }
}

export const deleteNotification = async (id: string) : returnType<string> => {
    try {
        const response = await axios.delete(`/user/notification/${id}`);

        return response.data.notificationId;
    } catch (err) {
        console.error(err);

        return undefined;
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

export const updateUserApi = async (updateData: { voiceChannelId?: string; guildId?: string; guildsIds?: string[]; userId: string; update: updatedPropertiesType<User> }) : Promise<User | undefined> => {
    try {
        const response = await axios.post('/user/update', { update: updateData.update });

        return response.data.user;
    } catch(err) {
        console.error(err);

        return undefined;
    }
}

export const updateMemberApi = async (updateData: { voiceChannelId?: string; channelId?: string; guildId: string; memberId: string; update: updatedPropertiesType<Member>; }) : Promise<{ channelId?: string; member: Member } | undefined> => {
    try {
        const response = await axios.post(`/guilds/${updateData.guildId}/${updateData.memberId}`, { update: updateData.update });

        return { channelId: updateData.channelId, member: response.data.member };
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