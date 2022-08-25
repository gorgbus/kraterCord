import axios from "axios";
import { DISCORD_API_URL } from "../utils/constants";

type Member = {
  user: {};
  nick: string;
  avatar?: any;
  roles: string[];
  joined_at: string;
  deaf: boolean;
  mute: boolean;
}

export async function authLogin(token: string) {
    return axios.get<Member>(`${DISCORD_API_URL}/users/@me/guilds/456060911573008385/member`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}