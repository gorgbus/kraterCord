import create from 'zustand';

type req = {
    friend: string;
    type: string;
}

export type State = {
    page: string;
    reqs: req[];
    friends: string[];
    setPage: (page: string) => void;
    setReqs: (reqs: req[]) => void;
    setFriends: (friends: string[]) => void;
    addReq: (req: req) => void;
    addFriend: (friend: string) => void;
    removeReq: (id: string) => void;
    removeFriend: (id: string) => void;
}

export const useFriend = create<State>((set) => ({
    page: "Online",
    reqs: [],
    friends: [],
    setPage: (page: string) => set((state) => ({
        page
    })),
    setReqs: (reqs: req[]) => set((state) => ({
        reqs
    })),
    setFriends: (friends: string[]) => set((state) => ({
        friends
    })),
    addReq: (req: req) => set((state) => ({
        reqs: [...state.reqs, req]
    })),
    addFriend: (friend: string) => set((state) => ({
        friends: [...state.friends, friend]
    })),
    removeReq: (id: string) => set((state) => ({
        reqs: state.reqs.filter((u) => u.friend !== id)
    })),
    removeFriend: (id: string) => set((state) => ({
        friends: state.friends.filter((id) => id !== id)
    }))
}));