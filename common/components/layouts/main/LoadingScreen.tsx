import { FC, useEffect } from "react";
import { useUserStore } from "@kratercord/common/store/user";
import { BaseProps, Guild, Member, Optional } from "@kratercord/common/types"
import { fetchOnLoad } from "@kratercord/common/api";
import { io } from "socket.io-client";
import { useSocket } from "@kratercord/common/store/socket";
import useUtil from "@kratercord/common/hooks/useUtil";
import { useSettings } from "../../../store/settings";

interface Props extends Optional<BaseProps, "params"> {
    refresh?: boolean
}

const LoadingScreen: FC<Props> = ({ Image, navigate, refresh }) => {
    const setUser = useUserStore(state => state.setUser);
    const updateUser = useUserStore(state => state.updateUser);
    const socket = useSocket(state => state.getSocket);
    const setSocket = useSocket(state => state.setSocket);
    const setWeb = useSettings(state => state.setWeb);

    const { checkSettings } = useUtil();

    const version = process.env.NEXT_PUBLIC_VERSION;

    useEffect(() => {
        setWeb(true);

        const load = async () => {
            const user = await fetchOnLoad();

            if (!user) return;

            setUser(user);

            if (!socket()) {
                const SOCKET = io(process.env.NEXT_PUBLIC_API_URL!, { withCredentials: true });

                setSocket(SOCKET);

                SOCKET.emit("setup", user.guilds.map((g: Guild) => g.id));

                SOCKET.on("online", (user: Member, id: string) => {
                    updateUser(user);

                    if (id) SOCKET.emit("status", user, id);
                });

                setSocket(SOCKET);
            }

            checkSettings();

            navigate("/channels/@me");
        }

        if (!refresh) load();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full font-semibold text-gray-100 bg-gray-800">
            <Image width={128} height={128} className='rounded-md' src='/images/kratercord.png' alt="kratercord-logo" />
            <span className='m-4 mt-2 text-xs text-gray-500'>KraterCord - v{version || 'idk'}</span>
        </div>
    )
}

export default LoadingScreen;