import { infQuery, message, _data } from "./types";
import { State as FriendState } from '../store/friend';

type group = {
    nextId: number;
    messages: message[];
}

export const isCompact = (pages: group[], group: group, msg: message, i: number) => {
    if (pages[pages.length - 1] === group && group.messages[group.messages.length - 1] === msg) {
        return false;
    }

    if (group.messages[group.messages.length - 1] !== msg) {
        if (msg.author._id !== group.messages[i + 1].author._id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(group.messages[i + 1].createdAt))) <= 1000 * 60) {
            return true;
        }

        return false;
    }

    i = pages.indexOf(group);

    if (group.messages[group.messages.length - 1] === msg) {
        if (msg.author._id !== pages[i + 1].messages[0].author._id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(pages[i + 1].messages[0].createdAt))) <= 1000 * 60) {
            return true;
        }

        return false;
    }

    return false;
}

export const isLast = (pages: group[], group: group, msg: message, i: number) => {
    if (pages[0].messages[0] === msg) {
        return true;
    }

    if (group.messages[0] !== msg) {
        if (msg.author._id !== group.messages[i - 1].author._id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(group.messages[i - 1].createdAt))) <= 1000 * 60) {
            return false;
        }

        return true;
    }

    i = pages.indexOf(group);

    if (group.messages[0] === msg) {
        if (msg.author._id !== pages[i - 1].messages[0].author._id) return false;

        if ((Number(new Date(msg.createdAt)) - Number(new Date(pages[i - 1].messages[0].createdAt))) <= 1000 * 60) {
            return false;
        }

        return true;
    }

    return true;
}

export const addMessage = (data: any, cache?: infQuery) => {
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

export const updateFriends = (type: string, id: string, state: FriendState) => {
    const { addFriend, addReq, removeFriend, removeReq } = state;

    switch(type) {
        case 'req':
            addReq({ friend: id, type: 'in' });

            break;
        case 'accept':
            addFriend(id);
            removeReq(id);

            break;
        case 'decline':
            removeReq(id);

            break;
        case 'remove':
            removeFriend(id);

            break;
    }
}