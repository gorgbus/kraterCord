import create from 'zustand';

type State = {
    open: boolean;
    openSettings: () => void;
    closeSettings: () => void;
}

export const useSettings = create<State>((set) => ({
    open: false,
    openSettings: () => set((state) => ({ open: true })),
    closeSettings: () => set((state) => ({ open: false })),
}));