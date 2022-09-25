import create from "zustand";
import { Socket } from "socket.io-client";

type State = {
    socket?: Socket;
    voiceSocket?: Socket;
    setuped: boolean;
    setup: () => void;
    setVoiceSocket: (voiceSocket: Socket) => void; 
    setSocket: (socket: Socket) => void;
    getSocket: () => Socket | undefined;
}

export const useSocket = create<State>((set, get) => ({
    socket: undefined,
    voiceSocket: undefined,
    setuped: false,
    setup: () => set({ setuped: true }),
    setVoiceSocket: (voiceSocket: Socket) => set({
        voiceSocket,
    }),
    setSocket: (socket: Socket) => set({
        socket,
    }),
    getSocket: () => get().socket,
}));