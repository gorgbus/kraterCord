import { AxiosResponse } from "axios";
import { Message, useUser } from "../store/user";

type group = {
    nextId: string;
    messages: Message[];
}

export const isCompact = (pages: group[], group: group, msg: Message, i: number) => {
    if (pages[pages.length - 1] === group && group.messages[group.messages.length - 1] === msg) {
        return false;
    }

    if (group.messages[group.messages.length - 1] !== msg) {
        if (msg.author.id !== group.messages[i + 1].author.id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(group.messages[i + 1].createdAt))) <= 1000 * 60) {
            return true;
        }

        return false;
    }

    i = pages.indexOf(group);

    if (group.messages[group.messages.length - 1] === msg) {
        if (msg.author.id !== pages[i + 1].messages[0].author.id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(pages[i + 1].messages[0].createdAt))) <= 1000 * 60) {
            return true;
        }

        return false;
    }

    return false;
}

export const isLast = (pages: group[], group: group, msg: Message, i: number) => {
    if (pages[0].messages[0] === msg) {
        return true;
    }

    if (group.messages[0] !== msg) {
        if (msg.author.id !== group.messages[i - 1].author.id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(group.messages[i - 1].createdAt))) <= 1000 * 60) {
            return false;
        }

        return true;
    }

    i = pages.indexOf(group);

    if (group.messages[0] === msg) {
        if (msg.author.id !== pages[i - 1].messages[0].author.id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(pages[i - 1].messages[0].createdAt))) <= 1000 * 60) {
            return false;
        }

        return true;
    }

    return true;
}

export const addMessage = (data: any, cache?: { pages: { messages: Message[]; nextId: string }[]; pageParams: [] }) => {
    if (cache && data) {
        const messages = cache.pages[0].messages;
        if (messages.length < 20) {
            messages.unshift(data);
        } else {
            let lastEl = messages[messages.length - 1];
            messages.unshift(data);
            messages.pop();

            for (const page of cache.pages) {
                if (page === cache.pages[cache.pages.length - 1] && page.messages.length === 20) {
                    cache.pages.push({ messages: [lastEl], nextId: page.nextId });
                    break;
                }

                if (page === cache.pages[0]) continue;

                if (page.messages.length < 20) {
                    page.messages.unshift(lastEl);
                    break;
                }
                
                page.messages.unshift(lastEl);
                lastEl = page.messages[page.messages.length - 1];
                page.messages.pop();
            }
        }

        return cache;
    }

    return false;
}

export const updateFriends = (response: AxiosResponse, type: string) => {
    const { addFriend, addRequest, removeFriend, removeRequest } = useUser.getState();

    switch(type) {
        case 'req':
            addRequest(response.data.request);

            break;
        case 'accept':
            addFriend(response.data.friend);
            removeRequest(response.data.requestId);

            break;
        case 'decline':
            removeRequest(response.data.requesterId);

            break;
        case 'remove':
            removeFriend(response.data.friendId);

            break;
    }
}

type Settings = {
    everyone: boolean;
    friends: boolean;
    nfSound: boolean;
    nfPopup: boolean;
    startup: boolean;
    startupSilent: boolean;
    minimize: boolean;
    audioInput: string;
}

export const getSettings = () : Settings | undefined => {

    const settings = localStorage.getItem('settings');

    if (settings) {
        return JSON.parse(settings);
    }

    return undefined;
}

export const checkSettings = () => {
    const settings = {
        everyone: true,
        friends: true,
        nfSound: true,
        nfPopup: true,
        startup: false,
        startupSilent: false,
        minimize: true,
        audioInput: 'default'
    } as any

    let storageSettings: any = localStorage.getItem('settings');

    if (storageSettings) {
        storageSettings = JSON.parse(storageSettings) as Settings | undefined;

        if (storageSettings) {
            let hasAll = true;

            Object.keys(settings).map(key => {
                const has = Object.hasOwn(storageSettings, key);

                if (!has) {
                    storageSettings[key] = settings[key];
                    hasAll = false;
                }
            });

            if (!hasAll) return localStorage.setItem('settings', JSON.stringify(storageSettings));

            return;
        }
    }

    localStorage.setItem('settings', JSON.stringify(settings));
}


export const setSetting = (key: string, value: boolean | string) => {
    const settings: any = getSettings();

    if (settings && typeof settings !== 'boolean') {
        if (settings[key] === value || typeof settings[key] === 'undefined') return;

        settings[key] = value;
        localStorage.setItem('settings', JSON.stringify(settings));
    }
}

export const playSound = (sound: string, loop: boolean) : HTMLAudioElement | undefined => {
    const settings = getSettings() as any;

    if (settings && settings[sound] === false) return undefined;

    const audio = new Audio(`/sounds/${sound}.mp3`);

    audio.loop = loop;
    audio.play();

    audio.onended = () => {
        audio.remove();
    }

    return audio;
}