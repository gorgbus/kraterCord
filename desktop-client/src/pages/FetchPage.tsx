import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@kratercord/common/store/user";
import { fetchOnLoad } from "@kratercord/common/api";
import { io } from "socket.io-client";
import { useSocket } from "@kratercord/common/store/socket";
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from "@tauri-apps/api";
import { Guild, Member } from "@kratercord/common/types";
import useUtil from "@kratercord/common/hooks/useUtil";

let version: string;

const FetchPage: FC = () => {
    const navigate = useNavigate();

    const setUser = useUserStore(state => state.setUser);
    const updateUser = useUserStore(state => state.updateUser);
    const { setSocket, socket } = useSocket();

    const { checkSettings } = useUtil();

    useEffect(() => {
        (async () => {
            version = await getVersion();

            const user = await fetchOnLoad();

            if (!user) return;

            setUser(user);

            if (!socket) {
                const url = await invoke("get_api_url");

                const SOCKET = io(url as string, { withCredentials: true });

                SOCKET.emit("setup", user.guilds.map((g: Guild) => g.id));

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