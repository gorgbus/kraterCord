import axios from "axios";

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
    return axios.get<Member>(`https://discord.com/api/v9/users/@me/guilds/456060911573008385/member`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}