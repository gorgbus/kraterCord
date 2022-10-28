import { RtpCodecCapability } from "mediasoup/node/lib/RtpParameters";
import { WorkerLogTag } from "mediasoup/node/lib/Worker";
import os from "os";
import { config } from "dotenv";
import { TransportListenIp } from "mediasoup/node/lib/Transport";

config();

export const MS_CONFIG = {
    listenIp: "0.0.0.0",
    listenPort: process.env.PORT,

    mediasoup: {
        numWorkers: Object.keys(os.cpus()).length,
        worker: {
            rtcMinPort: 10000,
            rtcMaxPort: 10500,
            logLevel: "debug",
            logTags: [
                "info",
                "ice",
                "dtls",
                "rtp",
                "srtp",
                "rtcp"
            ] as WorkerLogTag[]
        },
        router: {
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: "video",
                    mimeType: "video/VP8",
                    clockRate: 90000,
                    parameters: {
                        "x-google-start-bitrate": 1000
                    }
                },
            ] as RtpCodecCapability[]
        },
        
        webRtcTransport: {
            listenIps: [
                {
                    ip: "0.0.0.0",
                    announcedIp: process.env.IP,
                }
            ] as TransportListenIp[],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            initialAvailableOutgoingBitrate: 1000000
        },
    }
} as const;