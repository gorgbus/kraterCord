import { Server } from 'socket.io';
import { config } from 'dotenv';
import { sockets } from './sockets';
import { createWorker } from './util/worker';
config();

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST?.split(',');

const io = new Server(parseInt(PORT.toString()), {
    cors: {
        origin: HOST
    },
    pingTimeout: 60000,
});

(async () => {
    try {
        await createWorker();
    } catch (err) {
        console.log(err);
    }
})();

io.on('connection', (s) => {
    sockets(s);
});