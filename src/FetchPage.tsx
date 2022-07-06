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

const FetchPage: FC = () => {
    const navigate = useNavigate();

    const { setGuilds, setGuild } = useGuild(state => state);
    const { setChannels, addChannels } = useChannel(state => state);
    const { setUser, setUsers, updateUser } = useUser(state => state);
    const { setSocket, socket } = useSocket(state => state);
    const { setFriends, setReqs } = useFriend(state => state);

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