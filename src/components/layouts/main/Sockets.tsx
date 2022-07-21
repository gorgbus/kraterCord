import { FC, useEffect } from "react";
import { useQueryClient } from "react-query";
import { channel, useChannel } from "../../../store/channel";
import { useFriend } from "../../../store/friend";
import { useGuild } from "../../../store/guild";
import { notification, useNotification } from "../../../store/notification";
import { useSocket } from "../../../store/socket";
import { useUser } from "../../../store/user";
import { addMessage, playSound, updateFriends } from "../../../utils";
import { infQuery } from "../../../utils/types";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification'
import { useSettings } from "../../../store/settings";
import { createConsumer, loadDevice } from "../../../utils/vcLogic";

const Sockets: FC = () => {
    const updateNotification = useNotification(state => state.updateNotification);
    const socket = useSocket(state => state.socket);
    const channel = useChannel(state => state.channel);
    const channels = useChannel(state => state.channels);
    const currentChannel = useChannel(state => state.currentChannel);
    const guilds = useGuild(state => state.guilds);
    const user = useUser(state => state.user);
    const notifications = useNotification(state => state.notifications);
    const removeNotification = useNotification(state => state.removeNotification);
    const muted = useSettings(state => state.muted);
    const deafen = useSettings(state => state.deafen);
    const setMute = useSettings(state => state.setMuted);
    const removeUser = useChannel(state => state.removeUser);
    const addUser = useChannel(state => state.addUser);

    const getMuted = useSettings(state => state.getMuted);
    const getDeafen = useSettings(state => state.getDeafen);
    const getVoice = useChannel(state => state.getVoice);
    const producer = useSettings(state => state.producer);
    const voice = useChannel(state => state.voice);
    const updateChannel = useChannel(state => state.updateChannel);
    const muteConsumers = useSettings(state => state.muteConsumers);

    const friendState = useFriend();
    const queryClient = useQueryClient();

    useEffect(() => {
        const notification = notifications.find(n => n.channel === channel);

        if (notification) {
            removeNotification(channel);
            
            socket?.emit('notif_rm', channel, user._id);
        }
    }, [channel]);

    useEffect(() => {
        if (producer !== 'none') getMuted() ? socket?.emit('pause', producer, true) : socket?.emit('pause', producer, false);

        if (producer === 'none' && getVoice() !== 'none') socket?.emit('ms_setup', voice, loadDevice);

        socket?.emit('update_voice_state', getVoice(), user._id, getMuted(), getDeafen(), (updatedChannel: channel) => {
            updateChannel(updatedChannel);
        });
    }, [muted])

    useEffect(() => {
        muteConsumers();

        socket?.emit('update_voice_state', getVoice(), user._id, getMuted(), getDeafen(), (updatedChannel: channel) => {
            updateChannel(updatedChannel);
        });
    }, [deafen])

    useEffect(() => {
        socket?.on('friend-client', (type: string, id: string) => {
            updateFriends(type, id, friendState);
        });

        socket?.on("new_message", (data) => {
            if (!channels.find(ch => ch._id === data.id)) return;
            if (!guilds.find(gl => gl._id === data.guild) && data.guild !== 'none') return;

            if (currentChannel() !== data.id) {
                socket.emit('create_notif', {
                    channel: data.id,
                    guild: data.guild,
                    user: user._id
                }, async (notif: notification) => {
                    playSound('nfSound', false);

                    updateNotification(notif);

                    let permissionGranted = await isPermissionGranted();

                    if (!permissionGranted) {
                        const permission = await requestPermission();
                        permissionGranted = permission === 'granted';
                    }

                    if (permissionGranted) {
                        if (!data.msg.author) return;

                        sendNotification({ title: data.msg.author.username, body: data.msg.content, icon: data.msg.author.avatar });
                    }
                });
            }

            const cache = queryClient.getQueryData<infQuery>(["channel", data.id]);

            const newCache = addMessage(data.msg, cache);
            if (!newCache) return;

            queryClient.setQueryData(["channel", channel], newCache);
        });

        socket?.on('new_producer', (producerId, userId) => {
            createConsumer(producerId, userId);
        });

        socket?.on('updated_voice_state', (updatedChannel: channel) => {
            updateChannel(updatedChannel);
        });

        socket?.on('joined_channel', (channelId, userId, muted, deafen) => {
            addUser(channelId, userId, muted, deafen);
        });

        socket?.on('user_disconnected', (channelId, userId) => {
            removeUser(channelId, userId);
        });

        (async () => {
            type PermissionNameI = PermissionName & 'microphone'

            interface PermissionDescriptorI extends PermissionDescriptor {
                name: PermissionNameI;
            }

            const permissionStatus = await navigator.permissions.query({
                name: 'microphone'
            } as PermissionDescriptorI);

            if (permissionStatus && permissionStatus.state === 'denied') setMute(true);
        })();

        return () => {
            socket?.removeAllListeners();
        }
    }, []);

    return <></>
}

export default Sockets;