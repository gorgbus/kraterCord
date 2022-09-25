import { useEffect } from "react";
import { Guild, Member, useUser } from "../store/user";
import { fetchOnLoad } from "../utils/api";
import { io, Socket } from "socket.io-client";
import { useSocket } from "../store/socket";
import { checkSettings } from "../utils";
import { useRouter } from "next/router";
import Image from "next/future/image";
import { NextPage } from "next";

const version = process.env.NEXT_PUBLIC_VERSION;

const setuped = useSocket.getState().setuped;
const setup = useSocket.getState().setup;
const socket = useSocket.getState().socket;
const setSocket = useSocket.getState().setSocket;

let SOCKET: Socket;

if (!socket) {
    SOCKET = io(process.env.NEXT_PUBLIC_API_URL!);

    setSocket(SOCKET);
}


const FetchPage: NextPage<{ refresh?: boolean }> = ({ refresh }) => {
    const router = useRouter();

    const setUser = useUser(state => state.setUser);
    const updateUser = useUser(state => state.updateUser);
    // const socket = useSocket(state => state.socket);
    // const setSocket = useSocket(state => state.setSocket);

    useEffect(() => {
        (async () => {
            if (refresh) return;

            const user = await fetchOnLoad();

            if (!user) return;

            setUser(user);

            if (!setuped) {
                SOCKET.emit("setup", user.id, user.guilds.map((g: Guild) => g.id));

                setup();

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