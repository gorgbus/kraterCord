import { useMutation, useQueryClient } from "react-query";
import { createMessage, joinChannel, leaveChannel } from "../api";
import { useSocket } from "../store/socket";
import { useUserStore } from "../store/user";
import { Channel, Member, Message } from "../types";

const useChannel = () => {
    const queryClient = useQueryClient();

    const updateMember = useUserStore(state => state.updateMember);
    const socket = useSocket(state => state.getSocket);

    const addMessage = (message: Message, cache?: { pages: { messages: Message[]; nextId: string }[]; pageParams: [] }) => {
        if (cache && message) {
            const messages = cache.pages[0].messages;
            if (messages.length < 20) {
                messages.unshift(message);
            } else {
                let lastEl = messages[messages.length - 1];
                messages.unshift(message);
                messages.pop();

                for (const page of cache.pages) {
                    if (page === cache.pages[cache.pages.length - 1] && page.messages.length === 20) {
                        cache.pages.push({ messages: [lastEl], nextId: page.nextId });
                        break;
                    }

                    if (page === cache.pages[0]) continue;

                    if (page.messages.length < 20) {
                        page.messages.unshift(lastEl);
                        break;
                    }
                    
                    page.messages.unshift(lastEl);
                    lastEl = page.messages[page.messages.length - 1];
                    page.messages.pop();
                }
            }

            return cache;
        }

        return false;
    }

    const { mutate: addMessageSender } = useMutation(createMessage, {
        onMutate: async (msg) => {
            await queryClient.cancelQueries(['channel', msg.channelId]);

            const cache = queryClient.getQueryData<{ pages: { messages: Message[]; nextId: string }[]; pageParams: [] }>(["channel", msg.channelId]);
            const newCache = addMessage(msg as Message, cache);

            queryClient.setQueryData(["channel", msg.channelId], newCache);

            return {
                cache,
            }
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(['channel', data.channelId], context.cache);
        },
        onSettled: (data, _err, vars) => {
            if (data) {
                queryClient.invalidateQueries(['channel', data.channelId]);

                (vars.dm) ? socket()?.emit("create_message_dm", vars.friendId, data) : socket()?.emit("create_message", data);
            }
        }
    });

    const { mutate: addMessageReceiver } = useMutation(async (message: Message) => message, {
        onMutate: async (message) => {
            await queryClient.cancelQueries(["channel", message.channelId]);

            const cache = queryClient.getQueryData<{ pages: { messages: Message[]; nextId: string }[]; pageParams: [] }>(["channel", message.channelId]);
            const newCache = addMessage(message, cache);

            if (!newCache) return;

            queryClient.setQueryData(["channel", message.channelId], newCache);

            return { cache }
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channel", data.channelId], context.cache);
        },
        onSettled: (data) => {
            if (data) queryClient.invalidateQueries(["channel", data.channelId]);
        }
    });

    const { mutate: joinChannelMember } = useMutation(async (channelData: {
        guildId: string;
        channelId: string;
        member: Member;
    }) => channelData, {
        onMutate: async (channelData) => {
            await queryClient.cancelQueries(["channels", channelData.guildId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channelData.guildId]);

            if (!cache) return;

            const newCache = [...cache];

            const index = newCache.findIndex(chnl => chnl.id === channelData.channelId);

            if (index === -1) return;

            newCache[index].members = [...newCache[index].members, channelData.member];

            queryClient.setQueryData(["channels", channelData.guildId], newCache);

            return { cache };
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channels", data.guildId], context.cache);
        },
        onSettled: (data) => {
            if (data) queryClient.invalidateQueries(["channels", data.guildId]);
        }
    });

    const { mutate: joinChannelUser } = useMutation(joinChannel, {
        onMutate: async (channel) => {
            await queryClient.cancelQueries(["channels", channel.guildId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channel.guildId]);

            if (!cache) return;

            const newCache = [...cache];

            const index = newCache.findIndex(chnl => chnl.id === channel.channelId);

            if (index === -1) return;

            newCache[index].members = [...newCache[index].members, channel?.member!];

            updateMember(channel.member?.id!, { channels: [newCache[index]] });            

            queryClient.setQueryData(["channels", channel.guildId], newCache);

            return { cache };
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channels", data.guildId], context.cache);
        },
        onSettled: (data) => {
            if (data) queryClient.invalidateQueries(["channels", data.guildId]);
        }
    });

    const { mutate: leaveChannelUser } = useMutation(leaveChannel, {
        onMutate: async (channelData) => {
            await queryClient.cancelQueries(['channels', channelData.channelId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channelData.guildId]);

            if (!cache) return;

            const newCache = [...cache];

            const index = newCache.findIndex(c => c.id === channelData.channelId);

            if (index === -1) return;

            newCache[index].members = newCache[index].members.filter(u => u.id !== channelData.memberId);

            updateMember(channelData.memberId, { channels: [] });

            queryClient.setQueryData(["channels", channelData.guildId], newCache);

            // socket?.emit("leave_channel", guild, channelId, userId);

            return { cache };
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channels", data.guildId], context.cache);
        },
        onSettled: (data) => {
            if (data) queryClient.invalidateQueries(['channels', data.guildId]);
        }
    });

    const { mutate: leaveChannelMember } = useMutation(async (channelData: {
        guildId: string;
        channelId: string;
        memberId: string;
    }) => channelData, {
        onMutate: async (channelData) => {
            await queryClient.cancelQueries(['channels', channelData.guildId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channelData.guildId]);

            if (!cache) return;

            const newCache = [...cache];

            const index = newCache.findIndex(c => c.id === channelData.channelId);

            if (index === -1) return;

            newCache[index].members = newCache[index].members.filter(u => u.id !== channelData.memberId);

            queryClient.setQueryData(["channels", channelData.guildId], newCache);

            return { cache }
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channels", data.guildId], context.cache);
        },
        onSettled: (data) => {
            if (data) queryClient.invalidateQueries(['channels', data.guildId]);
        }
    });

    return { addMessageSender, addMessageReceiver, joinChannelMember, joinChannelUser, leaveChannelUser, leaveChannelMember }
}

export default useChannel;