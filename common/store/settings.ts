import create from 'zustand';
import { Device } from "mediasoup-client/lib/types";

type State = {
    page: string;
    open: boolean;
    unsaved: boolean;
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
    web: boolean;
    voiceSocketURL: string;
    setVoiceSocketURL: (url: string) => void;
    setWeb: (web: boolean) => void;
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
    setUnsaved: (unsaved: boolean) => void;
    getDevice: () => Device | undefined;
}

export const useSettings = create<State>((set, get) => ({
    page: 'Online',
    open: false,
    unsaved: false,
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
    web: false,
    voiceSocketURL: '',
    setVoiceSocketURL: (url: string) => set({ voiceSocketURL: url }),
    setWeb: (web: boolean) => set({ web }),
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
    setProducer: (producer: string) => set({ producer }),
    setDevice: (device: Device) => set({ device }),
    openSettings: () => set({ open: true }),
    closeSettings: () => set({ open: false }),
    setMuted: (muted) => set({ muted, wasMuted: muted }),
    toggleMute: () => set((state) => ({ muted: !state.muted, wasMuted: !state.muted ? true : false, deafen: state.deafen ? false : state.deafen })),
    toggleDeafen: () => set((state) => ({ deafen: !state.deafen, muted: state.wasMuted && state.deafen ? true : state.deafen ? false : true })),
    setVoiceChannel: (channel: string) => set({ voiceChannel: channel }),
    setVoiceGuild: (guild: string) => set({ voiceGuild: guild }),
    setTalkingUsers: (users: string[]) => set({ talkingUsers: users }),
    addTalkingUser: (user: string) => set((state) => ({ talkingUsers: [...state.talkingUsers, user] })),
    removeTalkingUser: (user: string) => set((state) => ({ talkingUsers: state.talkingUsers.filter(u => u !== user) })),
    getMuted: () => get().muted,
    getDeafen: () => get().deafen,
    getVoiceChannel: () => get().voiceChannel,
    getVoiceGuild: () => get().voiceGuild,
    setUnsaved: (unsaved) => set({ unsaved }),
    getDevice: () => get().device
}));