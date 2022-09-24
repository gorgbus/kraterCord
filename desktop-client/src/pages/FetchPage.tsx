import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Guild, Member, useUser } from "../store/user";
import { fetchOnLoad } from "../utils/api";
import { io } from "socket.io-client";
import { useSocket } from "../store/socket";
import { checkSettings } from "../utils";
import { getVersion } from '@tauri-apps/api/app';

let version: string;

const FetchPage: FC = () => {
    const navigate = useNavigate();

    const setUser = useUser(state => state.setUser);
    const updateUser = useUser(state => state.updateUser);
    const { setSocket, socket } = useSocket();

    useEffect(() => {
        (async () => {
            version = await getVersion();

            const user = await fetchOnLoad();

            if (!user) return;

            setUser(user);

            if (!socket) {
                const SOCKET = io("http://localhost:3001");

                SOCKET.emit("setup", user.id, user.guilds.map((g: Guild) => g.id));

                SOCKET.on("online", (user: Member, id: string) => {
                    updateUser(user);

                    if (id) SOCKET.emit("status", user, id);
                });

                setSocket(SOCKET);
            }

            checkSettings();

            navigate("/channels/@me");
        })();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full font-semibold text-gray-100 bg-gray-800">
            <img className='w-32 h-32 rounded-md' src='/images/kratercord.png' />
            <span className='m-4 mt-2 text-xs text-gray-500'>KraterCord - v{version || 'idk'}</span>
        </div>
    )
}

export default FetchPage;