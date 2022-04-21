import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { fetchChannels } from "../utils/api";
import { ChannelContext } from "../utils/contexts/ChannelContext";
import { UserContext } from "../utils/contexts/UserContext";
import { channel, guild, member } from "../utils/types";
import style from "./../styles/fetch.module.scss";

interface Props {
    guilds: guild[];
    member: member;
    channels: channel[];
}

const FetchPage: NextPage<Props> = ({ guilds, member, channels }) => {
    const { setGuilds } = useContext(ChannelContext);
    const { setUser, setFriendReqs, setFriends, setDms } = useContext(UserContext);

    const router = useRouter();

    useEffect(() => {
        setGuilds(guilds);
        setUser(member);
        setFriendReqs(member.friendRequests);
        setFriends(member.friends);
        setDms(channels);

        console.log(router);

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
    return fetchChannels(context);
}

export default FetchPage;