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
    users?: {
        user: string;
        talking?: boolean;
        muted: boolean;
        deafen: boolean;
    }[];
}

type State = {
    channels: channel[];
    channel: string;
    voice: string;
    voiceGuild: string;
    addUser: (channel: string, user: string, muted: boolean, deafen: boolean) => void;
    removeUser: (channel: string, user: string) => void;
    updateUser: (channel: string, user: string, talking: boolean, muted: boolean, deafen: boolean) => void;
    setVoice: (voice: string) => void;
    setVoiceGuild: (voiceGuild: string) => void;
    setChannel: (channel: string) => void;
    setChannels: (channels: channel[]) => void;
    addChannel: (channel: channel) => void;
    addChannels: (channels: channel[]) => void;
    updateChannel: (channel: channel) => void;
    currentChannel: () => string;
    getVoice: () => string;
}

export const useChannel = create<State>((set, get) => ({
    channels: channelsInitialState,
    channel: "none",
    voice: "none",
    voiceGuild: "none",
    addUser: (channel: string, user: string, muted: boolean, deafen: boolean) => set((state) => {
        const channels = state.channels;
        const index = channels.findIndex(c => c._id === channel);

        if (index === -1) return { channels };
        
        const updatedChannels = [...channels];
        updatedChannels[index].users?.push({ user, talking: false, muted, deafen });

        return { channels: updatedChannels };
    }),
    removeUser: (channel: string, user: string) => set((state) => {
        const channels = state.channels;
        const index = channels.findIndex(c => c._id === channel);

        if (index === -1) return { channels };

        const updatedChannels = [...channels];
        updatedChannels[index].users = updatedChannels[index].users?.filter(u => u.user !== user);

        return { channels: updatedChannels };
    }),
    updateUser: (channel: string, user: string, talking: boolean, muted: boolean, deafen: boolean) => set((state) => {
        const channels = state.channels;
        const index = channels.findIndex(c => c._id === channel);

        if (index === -1) return { channels };

        const updatedChannels = [...channels];
        updatedChannels[index].users = updatedChannels[index].users?.map(u => u.user === user ? { ...u, talking, muted: typeof muted !== 'undefined' ? muted : u.muted, deafen:  typeof deafen !== 'undefined' ? deafen : u.deafen } : u);

        return { channels: updatedChannels }
    }),
    setVoice: (voice: string) => set(() => ({ voice })),
    setVoiceGuild: (voiceGuild: string) => set(() => ({ voiceGuild })),
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
    updateChannel: (channel: channel) => set((state) => ({
        channels: state.channels.map(c => c._id === channel._id ? channel : c),
    })),
    currentChannel: () => get().channel,
    getVoice: () => get().voice,
}));