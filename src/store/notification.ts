import create from 'zustand';

export type notification = {
    guild?: string;
    channel: string;
    createdOn: Date;
    count: number;
}

type State = {
    notifications: notification[];
    setNotifications: (notifications: notification[]) => void;
    removeNotification: (channel: string) => void;
    updateNotification: (notification: notification) => void;
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
    })),
    updateNotification: (notification: notification) => set((state) => {
        const existing = state.notifications.find((n) => n.channel === notification.channel);

        if (existing) {
            return {
                notifications: state.notifications.map((n) => n.channel === notification.channel ? notification : n)
            }
        }

        return {
            notifications: [...state.notifications, notification]
        }
    })
}));
