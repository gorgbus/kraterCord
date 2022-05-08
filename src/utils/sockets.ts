import { Server, Socket } from "socket.io";
import Channel from "../database/schemas/Channel";
import Member, { member } from "../database/schemas/Member";
import Notif from "../database/schemas/Notif";
import mongoose from "mongoose";
import { createWorker } from "./worker";

interface ISocket extends Socket {
    user?: member;
}

let mediasoupRouter;

const socketIo = async (io: Server) => {
    try {
        mediasoupRouter = await createWorker();
    } catch (err) {
        console.log(err);
    }

    io.on("connection", (s: ISocket) => {
        console.log(`Socket: ${s.id} has connected`);

        s.on("setup", async (id: string, _user: member) => {
            s.join(id);
            s.join(`${id}-status`);

            s.user = _user;
            const user_ = await Member.findByIdAndUpdate(_user._id, { $set: { status: "online" } }, { new: true });
            s.broadcast.emit("online", user_);
        });

        s.on("update_user", async (user: member) => {
            const _user = await Member.findByIdAndUpdate(user._id, user, { new: true });
            s.broadcast.emit("online", _user);
        });

        s.on("fr_accept", (_id, friend) => {
            s.join(_id);
            s.to(_id).emit("fr_accepted", (friend));
            s.leave(_id);
        });

        s.on("fr_decline", (_id, friend) => {
            s.join(_id);
            s.to(_id).emit("fr_declined", (friend));
            s.leave(_id);
        });

        s.on("fr_remove", (_id, friend) => {
            s.join(_id);
            s.to(_id).emit("fr_removed", (friend));
            s.leave(_id);
        });

        s.on("fr_req", (_id, friend) => {
            console.log(_id, friend);
            s.join(_id);
            s.to(_id).emit("fr_reqd", (friend));
            s.leave(_id);
        });

        s.on("dm_create", (_id, dm) => {
            s.join(_id);
            s.to(_id).emit("dm_created", (dm));
            s.leave(_id);
        });

        s.on("create_message_dm", async (_id, data) => {
            s.join(_id);
            s.to(_id).emit("new_message", data);
            s.leave(_id);

            const users = await Member.find();

            let offline: mongoose.Types.ObjectId[] = [];

            for (const user of users) {
                if (!io.sockets.adapter.rooms.get(`${user._id}-status`)) {
                    const objId = new mongoose.Types.ObjectId(user._id)
                    offline.push(objId);
                }
            }

            const notif = {
                guild: data.guild,
                channel: data.msg.channel,
                createdOn: Date.now(),
            }

            await Notif.updateMany({ user: { $in: offline }, 'notifs.channel': data.msg.channel }, { $inc: { 'notifs.$.count': 1 }});
            await Notif.updateMany({ user: { $in: offline }, 'notifs.channel': { $nin: [data.id] } }, { $push: { notifs: notif } });
        });

        s.on("create_message", async (data) => {
            s.broadcast.emit("new_message", data);

            const users = await Member.find();

            let offline: mongoose.Types.ObjectId[] = [];

            for (const user of users) {
                if (!io.sockets.adapter.rooms.get(`${user._id}-status`)) {
                    const objId = new mongoose.Types.ObjectId(user._id)
                    offline.push(objId);
                }
            }

            const notif = {
                guild: data.guild,
                channel: data.msg.channel,
                createdOn: Date.now(),
            }

            await Notif.updateMany({ user: { $in: offline }, 'notifs.channel': data.msg.channel }, { $inc: { 'notifs.$.count': 1 }});
            await Notif.updateMany({ user: { $in: offline }, 'notifs.channel': { $nin: [data.id] } }, { $push: { notifs: notif } });
        });

        s.on("create_notif", async (data) => {
            const notif = {
                guild: data.guild,
                channel: data.channel,
                count: 1,
                createdOn: Date.now(),
            }

            await Notif.updateOne({ user: data.user, 'notifs.channel': data.channel }, { $inc: { 'notifs.$.count': 1 } });
            await Notif.updateOne({ user: data.user, 'notifs.channel': { $nin: [data.channel] } }, { $push: { notifs: notif } });
        })

        s.on("notif_rm", async (channel, user) => {
            await Notif.findOneAndUpdate({ user: user }, { $pull: { notifs: { channel } } });
        })

        s.on("join_channel", async (id, user) => {
            s.emit("joined_success", id);
            s.broadcast.emit("joined_channel", id, user);

            s.join(id);
            s.to(id).emit("join_success", id, user);

            try {
                await Channel.findByIdAndUpdate(id, { $push: { users: user } });
            } catch (err) {
                console.log(err);
            }

            s.on("disconnect", async () => {
                try {
                    await Channel.findByIdAndUpdate(id, { $pullAll: { users: [user] } });
                } catch (err) {
                    console.log(err);
                }
                s.broadcast.emit("user_disconnected", id, user);
            });
        });

        s.on("leave_channel", async (id, user) => {
            try {
                await Channel.findByIdAndUpdate(id, { $pullAll: { users: [user] } });
            } catch (err) {
                console.log(err);
            }
        });

        s.on("disconnect", async () => {
            if (!s.user) return;
            if (io.sockets.adapter.rooms.get(`${s.user?._id}-status`)) return;

            const user = await Member.findByIdAndUpdate(s.user?._id, { $set: { status: "offline" } }, { new: true });
            s.broadcast.emit("online", user);
        })

        s.on("dc", (id) => {
            console.log(`Socket: ${s.id} has disconnected`);
            s.disconnect();
        });
    });
}

export default socketIo;