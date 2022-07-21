import create from "zustand";

const initialState = {
    username: "none",
    _id: "none",
    avatar: "none",
    hash: "none"
};

export type user = {
    username: string;
    _id: string;
    avatar: string;
    status?: string;
    hash: string;
    muted?: boolean;
    deafen?: boolean;
}

type State = {
    user: user;
    users: user[];
    setUsers: (users: user[]) => void;
    addUser: (user: user) => void;
    setUser: (user: user) => void;
    updateUser: (user: user) => void;
}

export const useUser = create<State>((set) => ({
    user: initialState,
    users: [],
    setUser: (user: user) => set((state) => ({
        user: user,
    })),
    setUsers: (users: user[]) => set((state) => ({
        users: users,
    })),
    addUser: (user: user) => set((state) => ({
        users: [...state.users, user],
    })),
    updateUser: (user: user) => set((state) => ({
        users: state.users.map((u) => u._id === user._id ? user : u),
    })),
}));