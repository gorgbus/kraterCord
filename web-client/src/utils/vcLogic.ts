import { Device } from "mediasoup-client";
import { MediaKind, RtpCapabilities, RtpParameters, Transport, TransportOptions } from "mediasoup-client/lib/types";
import { getSettings } from ".";
import { useSettings } from "../store/settings";
import { useSocket } from "../store/socket";
import { useUser } from "../store/user";
import { io } from "socket.io-client";

export const disconnectSocket = () => {
    const voiceSocket = useSocket.getState().voiceSocket;
    const setVoiceSocket = useSocket.getState().setVoiceSocket;

    voiceSocket?.disconnect();
    setVoiceSocket(undefined!);
}

export const connectToChannel = (id: string) => {
    const setVoiceSocket = useSocket.getState().setVoiceSocket;
    const userId = useUser.getState().user.id;
    const voiceSocket = io(process.env.NEXT_PUBLIC_VOICE_URL!);

    setVoiceSocket(voiceSocket);

    console.log('connected to voice channel');

    voiceSocket.emit('setup', userId, id, loadDevice);
}

export const loadDevice = async ({ rtpCapabilities }: { rtpCapabilities: RtpCapabilities }) => {
    try {
        const socket = useSocket.getState().socket;
        const voiceSocket = useSocket.getState().voiceSocket;
        const getVoice = useSettings.getState().getVoiceChannel;
        const getVoiceGuild = useSettings.getState().getVoiceGuild;
        const userId = useUser.getState().user.id;
        const username = useUser.getState().user.username;
        const avatar = useUser.getState().user.avatar;
        const setDevice = useSettings.getState().setDevice;
        const getMuted = useSettings.getState().getMuted;
        const getDeafen = useSettings.getState().getDeafen;

        socket?.emit('user_join', { voiceGuild: getVoiceGuild(), channel: getVoice(), user: { id: userId, username, avatar, muted: getMuted(), deafen: getDeafen() } });

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

        voiceSocket?.emit('crt_trans', {
            rtpCapabilities: device.rtpCapabilities,
            channel: getVoice(),
            consumer: false
        }, createProducer)
    } catch (err: any) {
        console.error(err);

        if (err.name === "NotSupportedError") {
            alert("Your browser does not support WebRTC.");
        }
    }
}

const getProducers = (_channel: string) => {
    const voiceSocket = useSocket.getState().voiceSocket;

    voiceSocket?.emit('get_producers', (producerIds: { id: string; userId: string; }[]) => {
        producerIds.forEach(({ id, userId }) => {
            createConsumer(id, userId);
        });
    });
}

const createProducer = async (data: TransportOptions) => {
    try {
        const device = useSettings.getState().device;
        const channel = useSettings.getState().voiceChannel;
        const voiceSocket = useSocket.getState().voiceSocket;
        const userId = useUser.getState().user.id;
        const muted = useSettings.getState().muted;
        const setProducer = useSettings.getState().setProducer;
        const setVoiceStatus = useSettings.getState().setVoiceStatus;
        const setTrack = useSettings.getState().setTrack;

        if (!device) return;

        const transport = device.createSendTransport(data);
        const settings = getSettings();

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                deviceId: { exact: settings?.audioInput }
            },
            video: false
        });

        if (!stream) return;

        const interval = voiceActivity(stream, userId);

        const track = stream.getAudioTracks()[0];
        setTrack(track);

        transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
            try {
                voiceSocket?.emit('con_trans', dtlsParameters, false);

                callback();
            } catch (err: any) {
                errback(err);
            }
        });

        transport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
            try {
                voiceSocket?.emit('produce', kind, rtpParameters, false, ({ id, producerExists }: { id: string, producerExists: boolean }) => {
                    callback({ id });

                    setProducer(id);

                    if (muted) voiceSocket.emit('pause', id, true);

                    if (producerExists) return getProducers(channel);
                });
            } catch (err: any) {
                console.error(err);
                errback(err);
            }
        });

        transport.on('connectionstatechange', (state) => {
            if (state === 'closed' || state === 'disconnected') {
                track.stop();
                clearInterval(interval);
            }

            if (state !== 'new') setVoiceStatus(state);
        });

        await transport.produce({ track });
    } catch (err) {
        console.error(err);
    }
}

export const createConsumer = async (id: string, userId: string) => {
    try {
        const device = useSettings.getState().device;
        const voiceSocket = useSocket.getState().voiceSocket;

        if (!device) return;

        voiceSocket?.emit('crt_trans', { consumer: true }, (data: TransportOptions) => {
            const transport = device.createRecvTransport(data);

            transport.on('connect', ({ dtlsParameters }, callback) => {
                voiceSocket.emit("con_trans", dtlsParameters, true, data.id);

                callback();
            });

            consume(transport, id, data.id, userId);
        });
    } catch (err) {
        console.error(err);
    }
}

const consume = async (transport: Transport, producerId: string, transportId: string, userId: string) => {
    try {
        const device = useSettings.getState().device;
        const voiceSocket = useSocket.getState().voiceSocket;
        const addConsumer = useSettings.getState().addConsumer;
        const removeConsumer = useSettings.getState().removeConsumer;

        if (!device) return;
        
        voiceSocket?.emit('consume', device.rtpCapabilities, producerId, transportId, async ({ id, producerId, kind, rtpParameters }: { id: string; producerId: string; rtpParameters: RtpParameters; kind: MediaKind; }) => {
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

            voiceSocket.emit("resume", id);
        });
    } catch (err) {
        console.error(err);
    }
}

const voiceActivity = (stream: MediaStream, userId: string): NodeJS.Timer => {
    const addTalkingUser = useSettings.getState().addTalkingUser;
    const removeTalkingUser = useSettings.getState().removeTalkingUser;

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
            addTalkingUser(userId);
        } else {
            removeTalkingUser(userId);
        }
    }, 100);

    return interval;
}