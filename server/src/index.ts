import { config } from "dotenv";
import createApp from "./utils/createApp";
import socketIo from "./utils/sockets";
import { createServer } from "http";
import { Server } from "socket.io";
import "./prisma";

config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST?.split(',');
const VOICE_HOST = process.env.VOICE_HOST;
const VOICE_PORT = process.env.VOICE_PORT || 7777;

async function main() {
    try {
        const app = createApp();
        const httpServer = createServer(app);

        const io = new Server(httpServer, {
            pingTimeout: 60000,
            cors: {
                origin: HOST!,
                credentials: true
            }
        });

        httpServer.listen(PORT, () => console.log(`Running on port ${PORT}`));

        const serverIo = new Server(parseInt(VOICE_PORT.toString()), {
            cors: {
                origin: VOICE_HOST
            },
            pingTimeout: 60000,
        });

        socketIo(io, serverIo);
    } catch (error) {
        console.error(error);
    }
}

main();