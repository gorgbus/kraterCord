import create from 'zustand';
import { Device } from "mediasoup-client/lib/types";

type State = {
    open: boolean;
    muted: boolean;
    wasMuted: boolean;
    deafen: boolean;
    device?: Device;
    producer: string;
    consumers: HTMLAudioElement[];
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
}

export const useSettings = create<State>((set, get) => ({
    open: false,
    muted: false,
    wasMuted: false,
    deafen: false,
    device: undefined,
    producer: 'none',
    consumers: [],
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
    getMuted: () => !!get().muted,
    getDeafen: () => !!get().deafen,
}));