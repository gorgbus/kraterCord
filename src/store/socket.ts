import create from "zustand";
import { Socket } from "socket.io-client";

type State = {
    socket?: Socket;
    setSocket: (socket: Socket) => void;
}

export const useSocket = create<State>((set) => ({
    socket: undefined,
    setSocket: (socket: Socket) => set((state) => ({
        socket: socket,
    })),
}));