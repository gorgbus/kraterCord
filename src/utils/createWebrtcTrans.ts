import { Router } from "mediasoup/node/lib/Router";
import { WebRtcTransport } from "mediasoup/node/lib/types";
import { MS_CONFIG } from "./constants";

export const createWebRtcTrans = async (router: Router) => {
    return new Promise(async (resolve, reject) => {
        try {
            const transport: WebRtcTransport = await router.createWebRtcTransport(MS_CONFIG.mediasoup.webRtcTransport);

            await transport.setMaxIncomingBitrate(1500000);

            transport.on("dtlsstatechange", (state) => {
                if (state === "closed") {
                    transport.close();
                }
            });

            resolve(transport);
        } catch (err) {
            reject(err);
        }
    });
}