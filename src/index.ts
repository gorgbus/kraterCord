import { config } from "dotenv";
import createApp from "./utils/createApp";
import socketIo from "./utils/sockets";
import { createServer } from "http";
import { Server } from "socket.io";
import "./database";

config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST;

async function main() {
    try {
        const app = createApp();
        const httpServer = createServer(app);

        const io = new Server(httpServer, {
            pingTimeout: 60000,
            cors: {
                origin: [HOST!],
            }
        });

        socketIo(io);

        httpServer.listen(PORT, () => console.log(`Running on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

main();