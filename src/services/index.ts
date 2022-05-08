import axios from "axios";
import User from "../database/schemas/User";
import { DISCORD_API_URL } from "../utils/constants";
import { decrypt } from "../utils/crypto";

type Member = {
  user: {};
  nick: string;
  avatar?: any;
  roles: string[];
  joined_at: string;
  deaf: boolean;
  mute: boolean;
}

export async function authLogin(id: string) {
    const user = await User.findById(id);

    if(!user) throw new Error("No user found");

    return axios.get<Member>(`${DISCORD_API_URL}/users/@me/guilds/456060911573008385/member`, {
        headers: { Authorization: `Bearer ${decrypt(user.accessToken)}` }
    })
}