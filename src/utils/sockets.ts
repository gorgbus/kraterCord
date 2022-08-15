import { Server, Socket } from "socket.io";
import Channel from "../database/schemas/Channel";
import Member, { member } from "../database/schemas/Member";
import Notif from "../database/schemas/Notif";
import mongoose from "mongoose";
import { createRouter, createWorker } from "./worker";
import { Producer, WebRtcTransport, Consumer } from "mediasoup/node/lib/types";
import { createWebRtcTrans } from "./createWebrtcTrans";
import { transports, producer, consumer, rooms, peers } from "./types";

interface ISocket extends Socket {
    user?: string;
}

const sockets = new Map<string, string[]>();

let rooms: rooms = {};
let peers: peers = {};

let transports: transports[] = [];
let producers: producer[] = [];
let consumers: consumer[] = [];

const socketIo = async (io: Server) => {
    try {
        await createWorker();
    } catch (err) {
        console.log(err);
    }

    io.on("connection", (s: ISocket) => {
        console.log(`Socket: ${s.id} has connected`);

        s.on("setup", async (id: string, user: member) => {
            s.join(id);
            s.join(`${id}-status`);

            s.user = id;

            const socket = sockets.get(id);

            if (socket) {
                sockets.set(id, [...socket, s.id]);
            } else {
                sockets.set(id, [s.id]);
            }
            
            s.broadcast.emit("online", user, s.id);
        });

        s.on("status", (user: member, id: string) => {
            io.to(id).emit("online", user);
        });

        s.on("ms_setup", async (channel, callback) => {
            const router = await createRoom(channel, s.id);

            peers[s.id] = {
                socket: s,
                channel,
                transports: [],
                consumers: [],
                producers: [],
                user: s.user!,
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

            s.to(channel).emit("new_producer", producer.id, s.user!);

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
                console.log(producerId);

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

        s.on("update_user", async (user: member) => {
            const _user = await Member.findByIdAndUpdate(user._id, user, { new: true });
            s.broadcast.emit("online", _user);
        });

        s.on("friend", (type, id, friendId) => {
            emitToUser(friendId, io, 'friend-client', type, id);
        });

        s.on("dm_create", (_id, dm) => {
            s.join(_id);
            s.to(_id).emit("dm_created", (dm));
            s.leave(_id);
        });

        s.on("create_message_dm", async (id, data) => {
            emitToUser(id, io, 'new_message', data);

            let online: mongoose.Types.ObjectId[] = [];

            for (const user of sockets.keys()) {
                const objId = new mongoose.Types.ObjectId(user);
                online.push(objId);
            }

            const notif = {
                guild: data.guild,
                channel: data.msg.channel,
                createdOn: Date.now(),
            }

            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': data.msg.channel }, { $inc: { 'notifs.$.count': 1 }});
            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': { $nin: [data.id] } }, { $push: { notifs: notif } });
        });

        s.on("create_message", async (data) => {
            s.broadcast.emit("new_message", data);

            let online: mongoose.Types.ObjectId[] = [];

            for (const user of sockets.keys()) {
                const objId = new mongoose.Types.ObjectId(user);
                online.push(objId);
            }

            const notif = {
                guild: data.guild,
                channel: data.msg.channel,
                createdOn: Date.now(),
            }

            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': data.msg.channel }, { $inc: { 'notifs.$.count': 1 }});
            await Notif.updateMany({ user: { $nin: online }, 'notifs.channel': { $nin: [data.id] } }, { $push: { notifs: notif } });
        });

        s.on("create_notif", async (data, callback) => {
            const notif = {
                guild: data.guild,
                channel: data.channel,
                count: 1,
                createdOn: Date.now(),
            }

            await Notif.updateOne({ user: data.user, 'notifs.channel': data.channel }, { $inc: { 'notifs.$.count': 1 } });
            await Notif.updateOne({ user: data.user, 'notifs.channel': { $nin: [data.channel] } }, { $push: { notifs: notif } });

            const notifications = await Notif.findOne({ user: data.user });
            const notification = notifications?.notifs.find(n => n.channel === data.channel);

            if (notification) callback(notification);
        })

        s.on("notif_rm", async (channel, user) => {
            await Notif.findOneAndUpdate({ user: user }, { $pull: { notifs: { channel } } });
        })

        s.on("con_user", async (userId, channelId, user) => {
            io.to(userId).emit("user_join_new", s.id, channelId, user);
        });

        s.on('update_voice_state', async (channel: string, user: string, muted: boolean, deafen: boolean, callback) => {
            try {
                const updatedChannel = await Channel.findByIdAndUpdate(channel, { $set: { 'users.$[el].muted': muted, 'users.$[el].deafen': deafen } }, { arrayFilters: [{ 'el.user': user }], new: true });
                s.broadcast.emit('updated_voice_state', updatedChannel);
                callback(updatedChannel);
            } catch (err) {
                console.log(err);
            }
        });

        s.on("user_join", async (id: string, user: string, muted: boolean, deafen: boolean) => {
            const isAlready = await Channel.findById(id);

            if (isAlready?.users.find(u => u.user === user)) return console.log('already in room');

            s.broadcast.emit("joined_channel", id, user, muted, deafen);

            await s.join(id);

            try {
                await Channel.findByIdAndUpdate(id, { $push: { users: { user, muted, deafen } } });
            } catch (err) {
                console.log(err);
            }

            s.on("disconnect", async () => {
                try {
                    await Channel.findByIdAndUpdate(id, { $pull: { users: { user } } });
                } catch (err) {
                    console.log(err);
                }
                s.broadcast.emit("user_disconnected", id, user);
                await s.leave(id);
            });
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

        s.on("leave_channel", async (id, user) => {
            try {
                await Channel.findByIdAndUpdate(id, { $pull: { users: { user } } });

                s.broadcast.emit("user_disconnected", id, user);

                await s.leave(id);
                
                consumers = removeItems(consumers, s.id, "consumer");
                producers = removeItems(producers, s.id, "producer");
                transports = removeItems(transports, s.id, "transport");

                if (!peers[s.id]) return;

                const { channel } = peers[s.id];

                rooms[channel] = {
                    router: rooms[channel].router,
                    peers: rooms[channel].peers.filter(peer => peer !== s.id),
                }

                delete peers[s.id];
            } catch (err) {
                console.log(err);
            }
        });

        s.on("disconnect", async () => {
            if (!s.user) return;
            if (io.sockets.adapter.rooms.get(`${s.user}-status`)) return;

            const user = await Member.findByIdAndUpdate(s.user, { $set: { status: "offline" } }, { new: true });

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

            s.broadcast.emit("online", user);

            const socket = sockets.get(s.id);

            if (socket) {
                sockets.set(s.user, socket.filter((sc: string) => sc !== s.id));
            } else {
                sockets.delete(s.user);
            }

            console.log(`Socket: ${s.id} has disconnected`);
        });
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

const emitToUser = (id: string, io: Server, event: string, ...args: any) => {
    const user = sockets.get(id);
    let users: string[] = [];

    if (user) {
        user.map((s) => {
            users.push(s);
        });

        io.to(users).emit(event, ...args);
    }
}

export default socketIo;