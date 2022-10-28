import { FC, useEffect } from "react";
import { useSocket } from "@kratercord/common/store/socket";
import { useUserStore } from "@kratercord/common/store/user";
import { useSettings } from "@kratercord/common/store/settings";
import { createNotfication, deleteNotification } from "@kratercord/common/api";
import { useChannel, useMember, useUser, useUtil, useVoiceChannel } from "@kratercord/common/hooks";
import { BaseProps, Optional } from "../../../types";

const Sockets: FC<Optional<Optional<BaseProps, "Image">, "navigate">> = ({ params }) => {
    const { channelId } = params;

    const socket = useSocket(state => state.socket);
    const voiceSocket = useSocket(state => state.voiceSocket);
    const userId = useUserStore(state => state.user.id);
    const notifications = useUserStore(state => state.user.notifications);
    const upsertNotification = useUserStore(state => state.upsertNotification);
    const removeNotification = useUserStore(state => state.removeNotification);
    const updateFriend = useUserStore(state => state.updateFriend);
    const addFriend = useUserStore(state => state.addFriend);
    const removeRequest = useUserStore(state => state.removeRequest);
    const addRequest = useUserStore(state => state.addRequest);
    const removeFriend = useUserStore(state => state.removeFriend);
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

    const { updateUserSocket } = useUser();
    const { updateVoice, updateMemberVoice, updateMemberSocket } = useMember();
    const { joinChannelMember, leaveChannelMember, addMessageReceiver } = useChannel();
    const { playSound } = useUtil();
    const { createConsumer, loadDevice } = useVoiceChannel();

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
            updateVoice({
                muted: getMuted(),
                deafen: getDeafen(),
                guildId: voiceGuild,
                channelId: voice,
                memberId: userId
            });
    }, [muted, deafen])


    useEffect(() => {
        socket?.on("new_message", async (data) => {
            if (channelId !== data.id) {
                const notification = await createNotfication(data.id, data.guild);

                if (!notification) return;

                playSound('nfSound', false);

                upsertNotification(notification);
            }

            addMessageReceiver(data.msg);
        });

        socket?.on("update_client", (type: string, updateData) => {
            switch (type) {
                case "member": {
                    updateMemberSocket(updateData);

                    break;
                }

                case "user": {
                    updateUserSocket(updateData);

                    break;
                }

                case "friend": {
                    updateFriend(updateData.update.user.id, updateData.update);

                    break;
                }
            }
        });

        socket?.on("friend_client", (type: string, data) => {
            switch (type) {
                case "add": {
                    addFriend(data.user);
                    removeRequest(data.requestId);

                    break;
                }

                case "remove": {
                    removeFriend(data);

                    break;
                }

                case "request": {
                    addRequest(data);

                    break;
                }

                case "decline": {
                    removeRequest(data);

                    break;
                }
            }
        });

        voiceSocket?.on('new_producer', (producerId, userId) => {
            createConsumer(producerId, userId);
        });

        socket?.on('updated_voice_state', (voiceGuild: string, channel: string, user: string, userMuted: boolean, userDeafen: boolean) => {
            updateMemberVoice({
                guildId: voiceGuild,
                channelId: channel,
                memberId: user,
                muted: userMuted,
                deafen: userDeafen
            });
        });

        socket?.on('joined_channel', (data) => {
            joinChannelMember(data);
        });

        socket?.on('user_disconnected', (voiceGuild: string, channel: string, user: string) => {
            leaveChannelMember({
                channelId: channel,
                guildId: voiceGuild,
                memberId: user
            });
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