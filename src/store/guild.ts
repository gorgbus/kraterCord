import create from "zustand";

const guildInitialState = {
    name: "none",
    _id: "none",
    avatar: "none",
    firstChannel: "none",
};

export type guild = {
    name: string;
    _id: string;
    avatar: string;
    firstChannel: string;
}

type State = {
    guilds: guild[];
    guild: guild;
    setGuilds: (guilds: guild[]) => void;
    addGuild: (guild: guild) => void;
    setGuild: (guild: guild) => void;
}

export const useGuild = create<State>((set) => ({
    guilds: [],
    guild: guildInitialState,
    setGuilds: (guilds: guild[]) => set((state) => ({
        guilds: guilds,
    })),
    addGuild: (guild: guild) => set((state) => ({
        guilds: [...state.guilds, guild],
    })),
    setGuild: (guild: guild) => set((state) => ({
        guild: guild,
    })),
}));