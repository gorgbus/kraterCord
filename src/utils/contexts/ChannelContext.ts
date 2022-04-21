import { createContext } from "react";
import { Socket } from "socket.io-client";
import { channel, guild, member } from "../types";

type ChannelContextType = {
    channels?: channel[];
    setChannels: (channels: channel[]) => void;
    channel?: channel;
    setChannel: (channel: channel) => void;
    socket?: Socket;
    setSocket: (socket: Socket) => void;
    scroll: boolean[];
    setScroll: (scroll: boolean[]) => void;
    guilds?: guild[];
    setGuilds: (guilds: guild[]) => void;
    channelType: string;
    setChannelType: (channelType: string) => void;
}

export const ChannelContext = createContext<ChannelContextType>({
    setChannels: () => {},
    setChannel: () => {},
    setSocket: () => {},
    scroll: [false, true],
    setScroll: () => {},
    setGuilds: () => {},
    channelType: "dm",
    setChannelType: () => {},
});