import { Device } from "mediasoup-client";
import { MediaKind, RtpCapabilities, RtpParameters, Transport, TransportOptions } from "mediasoup-client/lib/types";
import { useChannel } from "../store/channel";
import { useSettings } from "../store/settings";
import { useSocket } from "../store/socket";
import { useUser } from "../store/user";

export const loadDevice = async ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities }) => {
    try {
        const socket = useSocket.getState().socket;
        const getVoice = useChannel.getState().getVoice;
        const user = useUser.getState().user;
        const setDevice = useSettings.getState().setDevice;
        const getMuted = useSettings.getState().getMuted;
        const getDeafen = useSettings.getState().getDeafen;

        socket?.emit('user_join', getVoice(), user._id, getMuted(), getDeafen());

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        if (!stream) return;

        stream.getAudioTracks().forEach(track => track.stop());

        const device = new Device()

        await device.load({ routerRtpCapabilities: rtpCapabilities });

        setDevice(device);

        if (!device) return;

        socket?.emit('crt_trans', {
            rtpCapabilities: device.rtpCapabilities,
            channel: getVoice(),
            consumer: false
        }, createProducer)
    } catch (err: any) {
        console.log(err);

        if (err.name === "NotSupportedError") {
            alert("Your browser does not support WebRTC.");
        }
    }
}

const getProducers = (channel: string) => {
    const socket = useSocket.getState().socket;

    socket?.emit('get_producers', (producerIds: { id: string; userId: string; }[]) => {
        producerIds.forEach(({ id, userId }) => {
            console.log(id, userId);
            createConsumer(id, userId);
        });
    });
}

const createProducer = async (data: TransportOptions) => {
    try {
        const device = useSettings.getState().device;
        const channel = useChannel.getState().voice;
        const socket = useSocket.getState().socket;
        const user = useUser.getState().user;
        const muted = useSettings.getState().muted;
        const setProducer = useSettings.getState().setProducer;

        if (!device) return;

        const transport = device.createSendTransport(data);

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
            },
            video: false
        });

        if (!stream) return;

        const interval = voiceActivity(stream, user._id);

        const track = stream.getAudioTracks()[0];

        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                socket?.emit('con_trans', dtlsParameters, false);

                callback();
            } catch (err: any) {
                errback(err);
            }
        });

        transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
            try {
                socket?.emit('produce', kind, rtpParameters, false, ({ id, producerExists }: { id: string, producerExists: boolean }) => {
                    callback({ id });

                    setProducer(id);

                    if (muted) socket.emit('pause', id, true);

                    if (producerExists) return getProducers(channel);
                });
            } catch (err: any) {
                errback(err);
            }
        });

        transport.on('connectionstatechange', (state) => {
            if (state === 'closed' || state === 'disconnected') {
                track.stop();
                clearInterval(interval);
            }
        });

        await transport.produce({ track });
    } catch (err) {
        console.log(err);
    }
}

export const createConsumer = async (id: string, userId: string) => {
    try {
        const device = useSettings.getState().device;
        const socket = useSocket.getState().socket;

        if (!device) return;

        socket?.emit('crt_trans', { consumer: true }, (data: TransportOptions) => {
            const transport = device.createRecvTransport(data);

            transport.on('connect', ({ dtlsParameters }, callback, errback) => {
                socket.emit("con_trans", dtlsParameters, true, data.id);

                callback();
            });

            consume(transport, id, data.id, userId);
        });
    } catch (err) {
        console.log(err);
    }
}

const consume = async (transport: Transport, producerId: string, transportId: string, userId: string) => {
    try {
        const device = useSettings.getState().device;
        const socket = useSocket.getState().socket;
        const addConsumer = useSettings.getState().addConsumer;
        const removeConsumer = useSettings.getState().removeConsumer;

        if (!device) return;
        
        socket?.emit('consume', device.rtpCapabilities, producerId, transportId, async ({ id, producerId, kind, rtpParameters }: { id: string; producerId: string; rtpParameters: RtpParameters; kind: MediaKind; }) => {
            const consumer = await transport.consume({ id, producerId, kind, rtpParameters });

            const { track } = consumer;
            
            const stream = new MediaStream([ track ]);

            const interval = voiceActivity(stream, userId);

            const audio = new Audio();
            audio.srcObject = stream;
            audio.play();

            addConsumer(audio);

            consumer.on('trackended', () => {
                consumer.close();
                removeConsumer(audio);
                audio.remove();
                clearInterval(interval);
            });

            socket.emit("resume", id);
        });
    } catch (err) {
        console.log(err);
    }
}

const voiceActivity = (stream: MediaStream, userId: string): number => {
    const updateUser = useChannel.getState().updateUser;
    const channel = useChannel.getState().voice;

    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;

    audioSource.connect(analyser);

    const volumes = new Uint8Array(analyser.frequencyBinCount);

    const interval = setInterval(() => {
        analyser.getByteFrequencyData(volumes);
        let volumeSum = 0

        for (const volume of volumes)
            volumeSum += volume;
        
        const averageVolume = volumeSum / volumes.length;

        if (averageVolume > 0) {
            updateUser(channel, userId, true, undefined!, undefined!);
        } else {
            updateUser(channel, userId, false, undefined!, undefined!);
        }
    }, 100);

    return interval;
}