import create from "zustand";

export type User = {
  id: string
  hash: string
  username: string
  avatar: string
  status: StatusType
  muted: boolean
  deafen: boolean
  friends: User[]
  incomingFriendReqs: FriendsRequest[]
  outgoingFriendReqs: FriendsRequest[]
  notifications: Notification[]
  guilds: Guild[]
  dms: Channel[]
}

export type FriendsRequest = {
  id: string
  user: User
  userId: string
  requester: User
  requesterId: string
}

export type Guild = {
  id: string
  name: string
  avatar: string
  owner: User
  ownerId: string
  redirectId: string
  members: Member[]
  channels: Channel[]
  invites: Invite[]
}

type Invite = {
    id: string
    code: string
    guildId: string
}

export type Channel = {
  id: string
  name: string
  type: ChannelType
  guildId: string | null
  users: User[]
  members: User[]
  notifications: Notification[]
}

export type Member = {
  id: string
  userId: string
  user: User
  guildId: string
}

export type Message = {
  id: string
  author: User
  authorId: string
  content: string
  channelId: string
  createdAt: Date
  updatedAt: Date
}

export type Notification = {
  id: string
  userId: string
  channelId: string
  guildId: string | null
  count: number
  createdAt: Date
}

export type ChannelType = 'VOICE' | 'TEXT' | 'DM'

type StatusType = 'ONLINE' | 'OFFLINE'


type State = {
    user: User
    updateUser: (args: object) => void
    setUser: (user: User) => void
    addGuild: (guild: Guild) => void
    removeGuild: (guildId: string) => void
    addFriend: (friend: User) => void
    removeFriend: (friendId: string) => void
    addRequest: (request: FriendsRequest) => void
    removeRequest: (requestId: string) => void
    upsertNotification: (notification: Notification) => void
    removeNotification: (notificationId: string) => void
    addDM: (dm: Channel) => void
    removeDM: (dmId: string) => void
}

export const useUser = create<State>((set) => ({
    user: {
        username: "none",
        id: "123",
        avatar: "/none",
        hash: "0000",
        status: "OFFLINE",
        muted: false,
        deafen: false,
        friends: [],
        incomingFriendReqs: [],
        outgoingFriendReqs: [],
        notifications: [],
        guilds: [],
        dms: []
    },
    updateUser: (args: object) => {
        set((state) => ({
            user: {
                ...state.user,
                ...args
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
    }
}));