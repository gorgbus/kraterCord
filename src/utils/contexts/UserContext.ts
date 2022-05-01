import { createContext } from "react";
import { channel, member, notif, req } from "../types";

type UserContextType = {
    user?: member;
    setUser: (user: member) => void;
    users: member[];
    setUsers: (users: member[]) => void;
    friends: member[];
    setFriends: (friends: member[]) => void;
    friendBar: string;
    setFriendBar: (friendBar: string) => void;
    friendReqs: req[];
    setFriendReqs: (friendReqs: req[]) => void;
    dms: channel[];
    setDms: (dms: channel[]) => void;
    notifs: notif[];
    setNotifs: (notifs: notif[]) => void;
}

export const UserContext = createContext<UserContextType>({
    setUser: () => {},
    friends: [],
    setFriends: () => {},
    friendBar: "friends",
    setFriendBar: () => {},
    friendReqs: [],
    setFriendReqs: () => {},
    dms: [],
    setDms: () => {},
    notifs: [],
    setNotifs: () => {},
    users: [],
    setUsers: () => {}
});