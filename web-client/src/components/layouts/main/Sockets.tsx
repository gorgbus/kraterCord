import { FC, useEffect } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useSocket } from "../../../store/socket";
import { Channel, Message, User, useUser } from "../../../store/user";
import { addMessage, /*getSettings,*/ playSound } from "../../../utils";
import { useSettings } from "../../../store/settings";
import { createConsumer, loadDevice } from "../../../utils/vcLogic";
import { createNotfication, deleteNotification, updateVoiceState } from "../../../utils/api";
import { useRouter } from "next/router";

const Sockets: FC = () => {
    const { channelId, guildId } = useRouter().query;

    const socket = useSocket(state => state.socket);
    const voiceSocket = useSocket(state => state.voiceSocket);
    const userId = useUser(state => state.user.id);
    const notifications = useUser(state => state.user.notifications);
    const upsertNotification = useUser(state => state.upsertNotification);
    const removeNotification = useUser(state => state.removeNotification);
    const muted = useSettings(state => state.muted);
    const deafen = useSettings(state => state.deafen);
    const setMute = useSettings(state => state.setMuted);

    const getMuted = useSettings(state => state.getMuted);
    const getDeafen = useSettings(state => state.getDeafen);
    const getVoice = useSettings(state => state.getVoiceChannel);
    const producer = useSettings(state => state.producer);
    const voice = useSettings(state => state.voiceChannel);
    const voiceGuild = useSettings(state => state.voiceGuild);
    const muteConsumers = useSettings(state => state.muteConsumers);

    const queryClient = useQueryClient();

    const { mutate: updateVoice } = useMutation(updateVoiceState, {
        onMutate: async ({ deafen, muted }) => {
            await queryClient.cancelQueries(["channels", guildId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", guildId]);

            if (!cache) return;

            const newCache = cache;

            const index = newCache.findIndex(ch => ch.id === voice);

            if (index === -1) return;

            newCache[index].members = newCache[index].members.map(user => user.id === userId ? { ...user, deafen, muted } : user);

            queryClient.setQueryData(["channels", guildId], newCache);

            socket?.emit("update_voice_state", voiceGuild, voice, userId, muted, deafen);

            return {
                cache,
            }
        },
        onError: (_error, _data, context: any) => {
            if (context) queryClient.setQueryData(["channels", guildId], context.cache);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["channels", guildId]);
        }
    });

    const { mutate: updateMessages } = useMutation(async (message: Message) => message, {
        onMutate: async (message) => {
            await queryClient.cancelQueries(["channel", message.channelId]);

            const cache = queryClient.getQueryData<{ pages: { messages: Message[]; nextId: string }[]; pageParams: [] }>(["channel", message.channelId]);
            const newCache = addMessage(message, cache);

            if (!newCache) return;

            queryClient.setQueryData(["channel", message.channelId], newCache);

            return {
                cache,
            }
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channel", data.channelId], context.cache);
        },
        onSettled: (data) => {
            queryClient.invalidateQueries(["channel", data?.channelId]);
        }
    });

    const { mutate: updateUser } = useMutation(async (data : { voiceGuild: string; channel: string; user: string; userMuted: boolean; userDeafen: boolean; }) => data, {
        onMutate: async (channelData) => {
            await queryClient.cancelQueries(["channels", channelData.voiceGuild]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channelData.voiceGuild]);

            if (!cache) return;

            const newCache = cache;

            const index = newCache.findIndex(ch => ch.id === channelData.channel);

            if (index === -1) return;

            newCache[index].users = newCache[index].users.map(usr => usr.id === channelData.user ? { ...usr, deafen: channelData.userDeafen, muted: channelData.userMuted } : usr);

            queryClient.setQueryData(["channels", channelData.voiceGuild], newCache);

            return {
                cache,
            }
        },
        onError: (_error, data, context: any) => {
            if (context) queryClient.setQueryData(["channels", data.voiceGuild], context.cache);
        },
        onSettled: (data) => {
            queryClient.invalidateQueries(["channels", data?.voiceGuild]);
        }
    });

    const { mutate: joinChannel } = useMutation(async (channelData : { voiceGuild: string; channel: string; user: { id: string; username: string; avatar: string; muted: boolean; deafen: boolean } }) => channelData, {
        onMutate: async (channelData) => {
            await queryClient.cancelQueries(["channels", channelData.voiceGuild]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channelData.voiceGuild]);

            if (!cache) return;

            const user = {
                id: channelData.user.id,
                username: channelData.user.username,
                avatar: channelData.user.avatar,
                muted: channelData.user.muted,
                deafen: channelData.user.deafen,
            }

            const newCache = cache;

            const index = newCache.findIndex(chnl => chnl.id === channelData.channel);

            if (index === -1) return;

            newCache[index].members = [...newCache[index].members, user as User];

            queryClient.setQueryData(["channels", channelData.voiceGuild], newCache);

            return { cache };
        },
        onError: (_error, data, context: any) => {
            queryClient.setQueryData(["channels", data.voiceGuild], context?.cache);
        },
        onSettled: (data) => {
            queryClient.invalidateQueries(["channels", data?.voiceGuild]);
        }
    });

    const { mutate: removeUser } = useMutation(async (channelData : { voiceGuild: string; channel: string; user: string }) => channelData, {
        onMutate: async (channelData) => {
            await queryClient.cancelQueries(['channels', channelData.voiceGuild]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", channelData.voiceGuild]);

            if (!cache) return;

            const newCache = cache;

            const index = newCache.findIndex(c => c.id === channelData.channel);

            if (index === -1) return;

            newCache[index].members = newCache[index].members.filter(u => u.id !== channelData.user);

            queryClient.setQueryData(["channels", channelData.voiceGuild], newCache);

            return { cache };
        },
        onError: (_error, data, context: any) => {
            queryClient.setQueryData(["channels", data.voiceGuild], context?.cache);
        },
        onSettled: (data) => {
            queryClient.invalidateQueries(['channels', data?.voiceGuild]);
        }
    });

    useEffect(() => {
        const notification = notifications.find(n => n.channelId === channelId);

        if (notification) {
            (async () => {
                const notificationId = await deleteNotification(notification.id)

                if (!notificationId) return;

                removeNotification(notificationId);
            })();
        }
    }, [channelId]);

    useEffect(() => {
        if (producer !== 'none') getMuted() ? voiceSocket?.emit('pause', producer, true) : voiceSocket?.emit('pause', producer, false);

        if (producer === 'none' && getVoice() !== 'none') voiceSocket?.emit('setup', voice, loadDevice);
    }, [muted])

    useEffect(() => {
        muteConsumers();
    }, [deafen])

    useEffect(() => {
        if (getVoice() !== 'none')
            updateVoice({ muted: getMuted(), deafen: getDeafen() });
    }, [muted, deafen])


    useEffect(() => {
        // socket?.on('friend-client', (type: string, id: string) => {
        //     // updateFriends(type, id, friendState);
        // });

        socket?.on("new_message", async (data) => {
            if (channelId !== data.id) {
                const notification = await createNotfication(data.id, data.guild);

                if (!notification) return;

                playSound('nfSound', false);

                upsertNotification(notification);
            }

            updateMessages(data.msg);
        });

        voiceSocket?.on('new_producer', (producerId, userId) => {
            createConsumer(producerId, userId);
        });

        socket?.on('updated_voice_state', (voiceGuild: string, channel: string, user: string, userMuted: boolean, userDeafen: boolean) => {
            updateUser({ voiceGuild, channel, user, userMuted, userDeafen });
        });

        socket?.on('joined_channel', (data) => {
            joinChannel(data);
        });

        socket?.on('user_disconnected', (voiceGuild: string, channel: string, user: string) => {
            removeUser({ voiceGuild, channel, user });
        });

        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            if (stream) {
                setMute(false);
                stream.getAudioTracks()[0].stop();
            }
        })();

        return () => {
            socket?.removeAllListeners();
        }
    }, []);

    return <></>
}

export default Sockets;