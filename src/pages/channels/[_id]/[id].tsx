import { useRouter } from "next/router";
import { Fragment, MutableRefObject, ReactElement, useContext, useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "react-query";
import { ChannelLayout } from "../../../components/layouts/guild/channelLayout";
import Message from "../../../components/message/Message";
import { fetchMessages } from "../../../utils/api";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";
import { UserContext } from "../../../utils/contexts/UserContext";
import { channel, guild, member, NextPageWithLayout } from "../../../utils/types";
import style from "./channel.module.scss";

interface Props {
    channels: channel[];
    member: member;
    guilds: guild[];
}

const ChannelPage: NextPageWithLayout<Props> = () => {
    const { setNotifs, notifs, user } = useContext(UserContext);
    const { socket } = useContext(ChannelContext);

    const router = useRouter();
    const messageRef = useRef() as MutableRefObject<HTMLDivElement>;

    const channelId = router.query.id as string;

    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isSuccess } = useInfiniteQuery(
        ["channel", channelId], 
        ({ pageParam = 0 }) => fetchMessages(channelId, pageParam),
        {
            getNextPageParam: (lastPage, pages) => {
                if (pages.length < lastPage.nextId) {
                    return pages.length;
                } else {
                    return undefined;
                }
            }
        }
    );

    const onScroll = (event) => {
        const target = event.currentTarget as HTMLDivElement;

        if ((target.clientHeight - target.scrollHeight) === target.scrollTop && hasNextPage) {
            fetchNextPage();
        }
    }

    const fetchMore = (event) => {
        const target = event.currentTarget as HTMLDivElement;

        if (target.clientHeight === target.scrollHeight && hasNextPage) {
            fetchNextPage();
        }
    }

    const onFocus = () => {
        const index = notifs.findIndex(nf => nf.channel === channelId);
        let temp = notifs;

        if (index != -1) {
            temp.splice(index, 1);
        }

        setNotifs(temp);
        router.push(window.location.pathname, window.location.pathname, { shallow: true });
        socket?.emit("notif_rm", channelId, user);
    }
    
    useEffect(() => {
        window.onfocus = onFocus;

        const index = notifs.findIndex(nf => nf.channel === channelId);
        let temp = notifs;
        if (index != -1) {
            temp.splice(index, 1);
            //notifs[index].count = 0;
        }

        setNotifs(temp);
        router.push(window.location.pathname, window.location.pathname, { shallow: true });
        socket?.emit("notif_rm", channelId, user);
    }, [channelId]);

    if (isLoading) {
        return (
            <div className={style.page}>
                loading...
            </div>
        )
    }

    if (isError) {
        console.log(error);

        return <div className={style.page}>neco se pokazilo</div>
    }

    return (
        <div className={style.page}>
            <div className={`${style.chat_box} ${style.scroll}`} onScroll={onScroll} ref={messageRef} onLoad={fetchMore} >
                {isSuccess ?
                    data?.pages.map((group, i) => {
                        return (
                            <Fragment key={i}>
                                {
                                    group.messages.map((msg, i, array) => {
                                        //msg = array[(array.length - 1) - i]

                                        return (
                                            <Message key={i} msg={msg}/>
                                        )
                                    })
                                }
                            </Fragment>
                        )
                    })
                    :
                    <div></div>
                }
            </div>
        </div>
    )
}

ChannelPage.getLayout = function (page: ReactElement) {
    return <ChannelLayout>{page}</ChannelLayout>
}

export default ChannelPage;