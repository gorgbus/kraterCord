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
}