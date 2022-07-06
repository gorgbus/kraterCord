import create from "zustand";

const channelsInitialState = [
    {
        name: "none",
        _id: "none",
        type: "none",
        guild: "none",
        users: []
    }
];

export type channel = {
    name: string;
    _id: string;
    type: string;
    guild?: string;
    users?: string[];
}

type State = {
    channels: channel[];
    channel: string;
    setChannel: (channel: string) => void;
    setChannels: (channels: channel[]) => void;
    addChannel: (channel: channel) => void;
    addChannels: (channels: channel[]) => void;
}

export const useChannel = create<State>((set) => ({
    channels: channelsInitialState,
    channel: "none",
    setChannels: (channels: channel[]) => set((state) => ({
        channels: channels,
    })),
    addChannel: (channel: channel) => set((state) => ({
        channels: [...state.channels, channel],
    })),
    addChannels: (channels: channel[]) => set((state) => ({
        channels: state.channels.concat(channels),
    })),
    setChannel: (channel: string) => set((state) => ({
        channel: channel,
    })),
}));