import { Consumer } from "mediasoup/node/lib/Consumer";
import { Producer } from "mediasoup/node/lib/Producer";
import { Transport } from "mediasoup/node/lib/Transport"

export type producerTrans = {
    Transport: Transport;
    id: string;
}

export type producer = {
    id: string;
    Producer: Producer;
}

export type consumer = {
    id: string;
    Consumer: Consumer;
}