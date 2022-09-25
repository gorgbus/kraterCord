import create from "zustand";
import { Socket } from "socket.io-client";

type State = {
    socket?: Socket;
    voiceSocket?: Socket;
    setVoiceSocket: (voiceSocket: Socket) => void; 
    setSocket: (socket: Socket) => void;
}

export const useSocket = create<State>((set) => ({
    socket: undefined,
    voiceSocket: undefined,
    setVoiceSocket: (voiceSocket: Socket) => set({
        voiceSocket,
    }),
    setSocket: (socket: Socket) => set({
        socket,
    }),
}));