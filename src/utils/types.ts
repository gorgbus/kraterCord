import { Consumer } from "mediasoup/node/lib/Consumer";
import { Producer } from "mediasoup/node/lib/Producer";
import { Router } from "mediasoup/node/lib/Router";
import { WebRtcTransport } from "mediasoup/node/lib/WebRtcTransport";
import { Socket } from "socket.io";

export type transports = {
    transport: WebRtcTransport;
    id: string;
    channel: string;
    consumer: boolean;
}

export type producer = {
    id: string;
    channel: string;
    producer: Producer;
}

export type consumer = {
    id: string;
    channel: string;
    consumer: Consumer;
}

export type rooms = {
    [key: string]: {
        router: Router;
        peers: string[];
    }
}

export type peers = {
    [key: string]: {
        socket: Socket;
        channel: string;
        transports: string[];
        producers: string[];
        consumers: string[];
        user: string;
    }
}