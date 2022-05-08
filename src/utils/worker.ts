import * as mediasoup from "mediasoup";
import { Router } from "mediasoup/node/lib/Router";
import { Worker } from "mediasoup/node/lib/Worker";
import { MS_CONFIG } from "./constants";

type worker = {
    worker: Worker;
    router: Router;
}

let nextMediasoupWorkerIndex = 0;

export const createWorker = async () => {
    const worker = await mediasoup.createWorker(MS_CONFIG.mediasoup.worker)

    worker.on("died", () => {
        console.log("mediasoup worker died");
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    });

    const router = await worker.createRouter({ mediaCodecs: MS_CONFIG.mediasoup.router.mediaCodecs });

    return router;
}