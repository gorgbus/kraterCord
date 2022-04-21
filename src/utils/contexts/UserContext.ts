import { createContext } from "react";
import { channel, member, req } from "../types";

type UserContextType = {
    user?: member;
    setUser: (user: member) => void;
    friends: member[];
    setFriends: (friends: member[]) => void;
    friendBar: string;
    setFriendBar: (friendBar: string) => void;
    friendReqs: req[];
    setFriendReqs: (friendReqs: req[]) => void;
    dms: channel[];
    setDms: (dms: channel[]) => void;
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
});