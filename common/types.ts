export type User = {
  readonly id: string
  hash: string
  username: string
  avatar: string
  status: StatusType
  about?: string
  background?: string
  muted: boolean
  deafen: boolean
  friends: User[]
  incomingFriendReqs: FriendsRequest[]
  outgoingFriendReqs: FriendsRequest[]
  notifications: Notification[]
  guilds: Guild[]
  dms: Channel[]
  members: Member[]
  createdAt: Date
}

export type FriendsRequest = {
  readonly id: string
  user: User
  readonly userId: string
  requester: User
  readonly requesterId: string
}

export type Guild = {
  readonly id: string
  name: string
  avatar?: string
  owner: User
  readonly ownerId: string
  redirectId: string
  members: Member[]
  channels: Channel[]
  invites: Invite[]
  createdAt: Date
}

export type Invite = {
    readonly id: string
    code: string
    readonly guildId: string
}

export type Channel = {
  readonly id: string
  name: string
  type: ChannelType
  readonly guildId: string | null
  users: User[]
  members: Member[]
  notifications: Notification[]
}

export type Member = {
  readonly id: string
  readonly userId: string
  user: User
  readonly guildId: string
  nickname?: string
  background?: string
  avatar?: string
  muted: boolean
  deafen: boolean
  channels: Channel[]
}

export type Message = {
  readonly id: string
  author: User
  readonly authorId: string
  member?: Member
  readonly memberId?: string
  content: string
  channelId: string
  createdAt: Date
  updatedAt: Date
}

export type Notification = {
  readonly id: string
  readonly userId: string
  readonly channelId: string
  readonly guildId: string | null
  count: number
  createdAt: Date
}

export type ChannelType = 'VOICE' | 'TEXT' | 'DM'

export type StatusType = 'ONLINE' | 'OFFLINE'

type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

export type updatedPropertiesType<T> = {
    [Property in keyof Pick<T, WritableKeys<T>>]?: T[Property]; 
}

export type BaseProps = {
    Image: (props: any) => JSX.Element;
    params: any;
    navigate: (url: string) => void;
}

export type Optional<T, K extends keyof T> = K extends keyof T ? Pick<Partial<T>, K> & Omit<T, K> : T;
//