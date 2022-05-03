import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { fetchOnStart } from "../utils/api";
import { ChannelContext } from "../utils/contexts/ChannelContext";
import { UserContext } from "../utils/contexts/UserContext";
import { channel, guild, member, notif } from "../utils/types";
import style from "./../styles/fetch.module.scss";

interface Props {
    guilds: guild[];
    member: member;
    channels: channel[];
    dms: channel[];
    notifs: notif[];
    users: member[];
}

const FetchPage: NextPage<Props> = ({ guilds, member, channels, dms, notifs, users }) => {
    const { setGuilds, setChannels } = useContext(ChannelContext);
    const { setUser, setFriendReqs, setFriends, setDms, setNotifs, setUsers } = useContext(UserContext);

    const router = useRouter();

    useEffect(() => {
        setGuilds(guilds);
        member.status = "online";
        setUser(member);
        setFriendReqs(member.friendRequests);
        setFriends(member.friends);
        setDms(dms);
        setChannels(channels);
        setNotifs(notifs);

        let temp = users;
        const index = temp.findIndex(u => u._id === member._id);
        temp[index].status = "online";

        setUsers(temp);

        if (!localStorage.getItem("settings")) {
            localStorage.setItem("settings", JSON.stringify({
                notificationSound: true,
            }));
        }

        setTimeout(() => {
            router.push("/channels/@me", "/channels/@me", { shallow: true });
        }, 1000);
        
    }, []);

    return (
        <div className={style.page}>
            <div className={style.loading}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    return fetchOnStart(context);
}

export default FetchPage;