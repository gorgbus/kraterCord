export type req = {
    friend: member;
    type: string;
}

export type member = {
    _id: string;
    discordId: string;
    username: string;
    avatar: string;
    hash: string;
    status: string;
    friends: member[];
    friendRequests: req[];
}

export type message = {
    _id: string;
    content: string;
    media?: {
        link: string;
        type: string;
    };
    author: member;
    channel: string;
    createdAt: Date;
}

export type channel = {
    _id: string;
    name: string;
    avatar: string;
    type: string;
    users: member[];
    guild: string;
}

export type guild = {
    _id: string;
    name: string;
    avatar: string;
    firstChannel: string;
}

export type infQueryData = {
    messages: message[];
    nextId: number;
}

export type infQuery = {
    pageParams: [];
    pages: infQueryData[];
}

export type _data = {
    id: string;
    msg: {
        content: string;
        media?: {
            link: string;
            type: string;
        }
        author: string;
    };
}