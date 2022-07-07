import create from 'zustand';

type notification = {
    guild?: string;
    channel: string;
    createdOn: Date;
}

type State = {
    notifications: notification[];
    setNotifications: (notifications: notification[]) => void;
    addNotification: (notification: notification) => void;
    removeNotification: (channel: string) => void;
}

export const useNotification = create<State>((set) => ({
    notifications: [],
    setNotifications: (notifications: notification[]) => set((state) => ({
        notifications
    })),
    addNotification: (notification: notification) => set((state) => ({
        notifications: [...state.notifications, notification]
    })),
    removeNotification: (channel: string) => set((state) => ({
        notifications: state.notifications.filter((n) => n.channel !== channel)
    }))
}));
