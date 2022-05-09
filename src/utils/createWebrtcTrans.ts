import { Router } from "mediasoup/node/lib/Router";
import { MS_CONFIG } from "./constants";

export const createWebRtcTrans = async (router: Router) => {
    const transport = await router.createWebRtcTransport(MS_CONFIG.mediasoup.webRtcTransport);

    await transport.setMaxIncomingBitrate(1500000);

    transport.on("dtlsstatechange", (state) => {
        if (state === "closed") {
            transport.close();
        }
    });

    return { Transport: transport };
}