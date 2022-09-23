import create from 'zustand';
import { Device } from "mediasoup-client/lib/types";

type State = {
    page: string;
    open: boolean;
    muted: boolean;
    wasMuted: boolean;
    deafen: boolean;
    device?: Device;
    producer: string;
    voiceStatus: string;
    consumers: HTMLAudioElement[];
    track?: MediaStreamTrack;
    talkingUsers: string[];
    voiceChannel: string;
    voiceGuild: string;
    setTrack: (track: MediaStreamTrack) => void;
    setVoiceStatus: (status: string) => void;
    setPage: (page: string) => void;
    addConsumer: (consumer: HTMLAudioElement) => void;
    removeConsumer: (consumer: HTMLAudioElement) => void;
    muteConsumers: () => void;
    setProducer: (producer: string) => void;
    setDevice: (device: Device) => void;
    openSettings: () => void;
    closeSettings: () => void;
    setMuted: (muted: boolean) => void;
    toggleMute: () => void;
    toggleDeafen: () => void;
    getMuted: () => boolean;
    getDeafen: () => boolean;
    setVoiceChannel: (channel: string) => void;
    getVoiceChannel: () => string;
    setVoiceGuild: (guild: string) => void;
    getVoiceGuild: () => string;
    setTalkingUsers: (users: string[]) => void;
    addTalkingUser: (user: string) => void;
    removeTalkingUser: (user: string) => void;
}

export const useSettings = create<State>((set, get) => ({
    page: 'Online',
    open: false,
    muted: true,
    wasMuted: true,
    deafen: false,
    device: undefined,
    producer: 'none',
    consumers: [],
    track: undefined,
    voiceStatus: "connecting",
    talkingUsers: [],
    voiceChannel: 'none',
    voiceGuild: 'none',
    setTrack: (track: MediaStreamTrack) => set({ track }),
    setVoiceStatus: (status) => set({ voiceStatus: status }),
    setPage: (page: string) => set({ page }),
    muteConsumers: () => set((state) => {
        const consumers = state.consumers;
        consumers.forEach(consumer => consumer.muted = state.deafen);
        
        return { consumers };
    }),
    addConsumer: (consumer: HTMLAudioElement) => set((state) => ({ consumers: [...state.consumers, consumer] })),
    removeConsumer: (consumer: HTMLAudioElement) => set((state) => ({ consumers: state.consumers.filter(c => c !== consumer) })),
    setProducer: (producer: string) => set((state) => ({ producer })),
    setDevice: (device: Device) => set((state) => ({ device })),
    openSettings: () => set((state) => ({ open: true })),
    closeSettings: () => set((state) => ({ open: false })),
    setMuted: (muted) => set((state) => ({ muted, wasMuted: muted })),
    toggleMute: () => set((state) => ({ muted: !state.muted, wasMuted: !state.muted ? true : false, deafen: state.deafen ? false : state.deafen })),
    toggleDeafen: () => set((state) => ({ deafen: !state.deafen, muted: state.wasMuted && state.deafen ? true : state.deafen ? false : true })),
    setVoiceChannel: (channel: string) => set((state) => ({ voiceChannel: channel })),
    setVoiceGuild: (guild: string) => set((state) => ({ voiceGuild: guild })),
    setTalkingUsers: (users: string[]) => set((state) => ({ talkingUsers: users })),
    addTalkingUser: (user: string) => set((state) => ({ talkingUsers: [...state.talkingUsers, user] })),
    removeTalkingUser: (user: string) => set((state) => ({ talkingUsers: state.talkingUsers.filter(u => u !== user) })),
    getMuted: () => get().muted,
    getDeafen: () => get().deafen,
    getVoiceChannel: () => get().voiceChannel,
    getVoiceGuild: () => get().voiceGuild,
}));