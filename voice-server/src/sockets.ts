import { Socket } from "socket.io";
import { createRouter } from "./util/worker";
import { Producer, WebRtcTransport, Consumer } from "mediasoup/node/lib/types";
import { createWebRtcTrans } from "./util/createWebrtcTrans";
import { transports, producer, consumer, rooms, peers } from "./util/types";
import { io } from "socket.io-client";
import { config } from "dotenv";

config();

let rooms: rooms = {};
let peers: peers = {};

let transports: transports[] = [];
let producers: producer[] = [];
let consumers: consumer[] = [];

export const sockets = async (s: Socket) => {
    console.log(`Socket ${s.id} has connected`);

    s.on('disconnect', () => {
        console.log(`Socket ${s.id} has disconnected`);

        const mainServer = io(process.env.SERVER_URL!);

        mainServer.emit("user_left", (peers[s.id].user, peers[s.id].channel));

        mainServer.disconnect();

        consumers = removeItems(consumers, s.id, "consumer");
        producers = removeItems(producers, s.id, "producer");
        transports = removeItems(transports, s.id, "transport");

        if (peers[s.id]) {
            const { channel } = peers[s.id];

            delete peers[s.id];
            
            rooms[channel] = {
                router: rooms[channel].router,
                peers: rooms[channel].peers.filter(peer => peer !== s.id),
            }
        }

    });

    s.on("setup", async (user, channel, callback) => {
        const router = await createRoom(channel, s.id);

        peers[s.id] = {
            socket: s,
            channel,
            transports: [],
            consumers: [],
            producers: [],
            user,
        }

        s.join(channel);

        callback({ rtpCapabilities: router.rtpCapabilities });
    });

    s.on("crt_trans", async ({ consumer }, callback) => {
        const { channel } = peers[s.id];
        const router = rooms[channel].router;

        createWebRtcTrans(router).then((transport) => {
            callback({
                dtlsParameters: transport.dtlsParameters, 
                id: transport.id, 
                iceParameters: transport.iceParameters, 
                iceCandidates: transport.iceCandidates
            });

            addTransport(transport, channel, s.id, consumer);
        }, error => {
            console.log(error);
        });
    });

    s.on("con_trans", async (dtlsParameters, consumer, id?) => {
        getTransport(s.id, consumer, id).connect({ dtlsParameters });
    });

    s.on("produce", async (kind, rtpParameters, consumer, callback) => {
        const producer = await getTransport(s.id, consumer).produce({ kind, rtpParameters })
        const { channel } = peers[s.id];

        addPruducer(producer, channel, s.id);

        s.to(channel).emit("new_producer", producer.id, peers[s.id].user);

        callback({ 
            id: producer.id,
            producerExists: producers.length > 1 ? true : false
        });
    });

    s.on("get_producers", (callback) => {
        const { channel } = peers[s.id];
        let producerList: {id: string; userId: string;}[] = [];

        producers.forEach(pd => {
            if (pd.id !== s.id && pd.channel === channel) {
                producerList = [...producerList, { id: pd.producer.id, userId: peers[pd.id].user }];
            }
        });

        callback(producerList);
    });

    s.on("consume", async (rtpCapabilities, producerId, transportId, callback) => {
        try {
            const { channel } = peers[s.id];
            const router = rooms[channel].router;
            const consumerTrans = transports.find(td => td.consumer && td.transport.id == transportId)?.transport;

            if (router.canConsume({
                producerId,
                rtpCapabilities
            })) {
                const consumer = await consumerTrans?.consume({ rtpCapabilities, paused: true, producerId });

                if (!consumer) return;

                consumer.on("producerclose", () => {
                    consumerTrans?.close();
                    transports = transports.filter(td => td.transport.id !== consumerTrans?.id);

                    consumer.close();
                    consumers = consumers.filter(cd => cd.consumer.id !== consumer.id);
                });

                addConsumer(consumer!, channel, s.id);

                callback({
                    producerId: producerId,
                    id: consumer.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    type: consumer.type,
                });
            }
        } catch (err) {
            console.error(err);
        }
    });

    s.on('pause', async (id, pause) => {
        const producer = producers.find(p => p.producer.id === id)?.producer;

        pause ? await producer?.pause() : await producer?.resume();
    });

    s.on("resume", async (id) => {
        const consumer = consumers.find(c => c.consumer.id === id)?.consumer;

        await consumer?.resume();
    });

    s.on('swapping_media', (callback) => {
        consumers = removeItems(consumers, s.id, "consumer");
        producers = removeItems(producers, s.id, "producer");
        transports = removeItems(transports, s.id, "transport");

        if (!peers[s.id]) return callback();

        const { channel } = peers[s.id];

        rooms[channel] = {
            router: rooms[channel].router,
            peers: rooms[channel].peers.filter(peer => peer !== s.id),
        }

        delete peers[s.id];

        callback();
    });
}

const createRoom = async (roomName: string, socketId: string) => {
    let router;
    let peers: string[] = [];

    if (rooms[roomName]) {
        router = rooms[roomName].router
        peers = rooms[roomName].peers || []
    } else {
        router = await createRouter();
    }

    rooms[roomName] = {
        router,
        peers: [...peers, socketId]
    }

    return router;
}

const addTransport = (transport: WebRtcTransport, channel: string, id: string, consumer: boolean) => {
    transports = [
        ...transports,
        { id, transport, channel, consumer }
    ]

    peers[id] = {
        ...peers[id],
        transports: [
           ...peers[id].transports,
           transport.id, 
        ]
    }
}

const addPruducer = (producer: Producer, channel: string, id: string) => {
    producers = [
        ...producers,
        { id, producer, channel }
    ]

    peers[id] = {
        ...peers[id],
        producers: [
            ...peers[id].producers,
            producer.id
        ]
    }
}

const addConsumer = (consumer: Consumer, channel: string, id: string) => {
    consumers = [
        ...consumers,
        { id, consumer, channel }
    ]

    peers[id] = {
        ...peers[id],
        consumers: [
            ...peers[id].consumers,
            consumer.id
        ]
    }
}

const getTransport = (id: string, consumer: boolean, transId?: string) => transId ? transports.filter(transport => transport.id === id && transport.consumer === consumer && transport.transport.id === transId)[0].transport : transports.filter(transport => transport.id === id && transport.consumer === consumer)[0].transport;

const removeItems = (items: Array<any>, id: string, type: string) => {
    items.forEach(item => {
        if (item.id === id) {
            item[type].close();
        }
    });

    items = items.filter(item => item.id !== id);

    return items;
}