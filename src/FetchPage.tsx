import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChannel } from "./store/channel";
import { useGuild } from "./store/guild";
import { useUser } from "./store/user";
import { fetchOnLoad } from "./utils/api";
import { io } from "socket.io-client";
import { useSocket } from "./store/socket";
import { member } from "./utils/types";
import { useFriend } from "./store/friend";
import { useNotification } from "./store/notification";

const FetchPage: FC = () => {
    const navigate = useNavigate();

    const { setGuilds, setGuild } = useGuild();
    const { setChannels, addChannels } = useChannel();
    const { setUser, setUsers, updateUser } = useUser();
    const { setSocket, socket } = useSocket();
    const { setFriends, setReqs } = useFriend();
    const { setNotifications } = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            const { member, guilds, channels, dms, notifs, users } = await fetchOnLoad();

            setGuilds(guilds);

            setChannels(channels);
            addChannels(dms);

            setUser(member);
            setUsers(users);
            updateUser(member);

            setReqs(member.friendRequests);
            setFriends(member.friends);

            setNotifications(notifs);

            if (!socket) {
                const SOCKET = io("http://localhost:3001");

                SOCKET.emit("setup", member._id, member);

                SOCKET.on("online", (user: member, id: string) => {
                    updateUser(user);

                    if (id) SOCKET.emit("status", member, id);
                });

                setSocket(SOCKET);
            }

            navigate("/channels/@me");
        }

        fetchData();
    }, []);

    return (
        <div>
        </div>
    )
}

export default FetchPage;