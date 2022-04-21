import { NextPage } from "next";
import { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";

export type NextPageWithLayout<T> = NextPage<T> & {
    getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout<T> = AppProps & {
    Component: NextPageWithLayout<T>;
};

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
    friends: member[];
    friendRequests: req[];
}

export type message = {
    _id: string;
    content: string;
    media: {
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

export type infQuery = {
    pageParams: [];
    pages: infQueryData[];
}

export type infQueryData = {
    messages: message[];
    nextId: number;
}