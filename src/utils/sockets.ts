import { Server } from "socket.io";
import Channel from "../database/schemas/Channel";

function socketIo(io: Server, peerServer: any) {
    io.on("connection", (s) => {
        console.log(`Socket: ${s.id} has connected`);

        s.on("setup", (id) => {
            s.join(id);
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

        s.on("create_message", (data) => {
            s.broadcast.emit("new_message", data);
        });

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

        s.on("dc", (id) => {
            console.log(`Socket: ${s.id} has disconnected`);
            s.disconnect();
        });
    });

    peerServer.on("connection", (client: any) => {
        console.log(`Peer: ${client.id} has connected`)
    });

    peerServer.on("disconnect", (client: any) => {
        console.log(`Peer: ${client.id} has disconnected`)
    });
}
export default socketIo;