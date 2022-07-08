import { FC, useEffect } from "react";
import { useQueryClient } from "react-query";
import { useChannel } from "../store/channel";
import { useFriend } from "../store/friend";
import { useGuild } from "../store/guild";
import { notification, useNotification } from "../store/notification";
import { useSocket } from "../store/socket";
import { useUser } from "../store/user";
import { addMessage, updateFriends } from "../utils";
import { infQuery } from "./../utils/types";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification'

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
    }, []);

    return <></>
}

export default Sockets;