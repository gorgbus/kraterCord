import { useEffect } from "react";
import { useUserStore } from "@kratercord/common/store/user";
import { Guild, Member } from "@kratercord/common/types"
import { fetchOnLoad } from "@kratercord/common/api";
import { io } from "socket.io-client";
import { useSocket } from "@kratercord/common/store/socket";
import useUtil from "@kratercord/common/hooks/useUtil";
import { useRouter } from "next/router";
import Image from "next/future/image";
import { NextPage } from "next";

const version = process.env.NEXT_PUBLIC_VERSION;

const FetchPage: NextPage<{ refresh?: boolean }> = ({ refresh }) => {
    const router = useRouter();

    const setUser = useUserStore(state => state.setUser);
    const updateUser = useUserStore(state => state.updateUser);
    const socket = useSocket(state => state.getSocket);
    const setSocket = useSocket(state => state.setSocket);
    const { checkSettings } = useUtil();

    useEffect(() => {
        (async () => {
            if (refresh) return;

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

            router.push("/channels/@me");
        })();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full font-semibold text-gray-100 bg-gray-800">
            <Image width={128} height={128} className='rounded-md' src='/images/kratercord.png' alt="kratercord-logo" />
            <span className='m-4 mt-2 text-xs text-gray-500'>KraterCord - v{version || 'idk'}</span>
        </div>
    )
}

export default FetchPage;