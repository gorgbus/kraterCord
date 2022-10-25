import create from "zustand";
import { User, Guild, FriendsRequest, Channel, Member, Notification, updatedPropertiesType } from "../types";

type State = {
    user: User
    updateUser: (update: updatedPropertiesType<User>) => void
    setUser: (user: User) => void
    addGuild: (guild: Guild) => void
    removeGuild: (guildId: string) => void
    addFriend: (friend: User) => void
    updateFriend: (friendId: string, update: updatedPropertiesType<User>) => void
    removeFriend: (friendId: string) => void
    addRequest: (request: FriendsRequest) => void
    removeRequest: (requestId: string) => void
    upsertNotification: (notification: Notification) => void
    removeNotification: (notificationId: string) => void
    addDM: (dm: Channel) => void
    removeDM: (dmId: string) => void
    updateMember: (memberId: string, update: updatedPropertiesType<Member>) => void
    updateMemberUser: (update: updatedPropertiesType<User>) => void
    addMember: (member: Member) => void
}

export const useUserStore = create<State>((set) => ({
    user: {
        username: "none",
        id: "123",
        avatar: "/none",
        hash: "0000",
        status: "OFFLINE",
        background: "",
        muted: false,
        deafen: false,
        friends: [],
        incomingFriendReqs: [],
        outgoingFriendReqs: [],
        notifications: [],
        guilds: [],
        dms: [],
        members: [],
        createdAt: new Date()
    },
    updateUser: (update: updatedPropertiesType<User>) => {
        set((state) => ({
            user: {
                ...state.user,
                ...update
            }
        }))
    },
    setUser: (user: User) => set({ user }),
    addGuild: (guild: Guild) => {
        set((state) => ({
            user: {
                ...state.user,
                guilds: [...state.user.guilds, guild]
            }
        }))
    },
    removeGuild: (guildId: string) => {
        set((state) => ({
            user: {
                ...state.user,
                guilds: state.user.guilds.filter((guild) => guild.id !== guildId)
            }
        }))
    },
    addFriend: (friend: User) => {
        set((state) => ({
            user: {
                ...state.user,
                friends: [...state.user.friends, friend]
            }
        }))
    },
    removeFriend: (friendId: string) => {
        set((state) => ({
            user: {
                ...state.user,
                friends: state.user.friends.filter((friend) => friend.id !== friendId)
            }
        }))
    },
    updateFriend: (friendId: string, update: updatedPropertiesType<User>) => {
        set((state) => ({
            user: {
                ...state.user,
                friends: state.user.friends.map((friend) => friend.id === friendId ? { ...friend, ...update } : friend)
            }
        }))
    },
    addRequest: (request: FriendsRequest) => {
        set((state) => ({
            user: {
                ...state.user,
                incomingFriendReqs: [...state.user.incomingFriendReqs, request]
            }
        }))
    },
    removeRequest: (requestId: string) => {
        set((state) => ({
            user: {
                ...state.user,
                incomingFriendReqs: state.user.incomingFriendReqs.filter((request) => request.id !== requestId)
            }
        }))
    },
    upsertNotification: (notification: Notification) => {
        set((state) => ({
            user: {
                ...state.user,
                notifications: state.user.notifications.some((n) => n.id === notification.id) ? state.user.notifications.map((n) => n.id === notification.id ? notification : n) : [...state.user.notifications, notification]
            }
        }))
    },
    removeNotification: (notificationId: string) => {
        set((state) => ({
            user: {
                ...state.user,
                notifications: state.user.notifications.filter((notification) => notification.id !== notificationId)
            }
        }))
    },
    addDM: (dm: Channel) => {
        set((state) => ({
            user: {
                ...state.user,
                dms: [...state.user.dms, dm]
            }
        }))
    },
    removeDM: (dmId: string) => {
        set((state) => ({
            user: {
                ...state.user,
                dms: state.user.dms.filter((dm) => dm.id !== dmId)
            }
        }))
    },
    updateMember: (memberId: string, update: updatedPropertiesType<Member>) => {
        set((state) => ({
            user: {
                ...state.user,
                members: state.user.members.map((member) => member.id === memberId ? { ...member, ...update } : member)
            }
        }))
    },
    addMember: (member: Member) => {
        set((state) => ({
            user: {
                ...state.user,
                members: [...state.user.members, member]
            }
        }))
    },
    updateMemberUser: (update: updatedPropertiesType<User>) => {
        set((state) => ({
            user: {
                ...state.user,
                members: state.user.members.map((member) => ({ ...member, user: { ...member.user, ...update } }))
            }
        }))
    }
}));