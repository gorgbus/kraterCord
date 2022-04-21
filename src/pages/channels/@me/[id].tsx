import { useRouter } from "next/router";
import { Fragment, MutableRefObject, ReactElement, useContext, useRef } from "react";
import { useInfiniteQuery } from "react-query";
import { ChannelLayout } from "../../../components/layouts/guild/channelLayout";
import Message from "../../../components/message/Message";
import { fetchMessages } from "../../../utils/api";
import { NextPageWithLayout } from "../../../utils/types";
import style from "./../[_id]/channel.module.scss";

const DmPage: NextPageWithLayout<any> = () => {
    const messageRef = useRef() as MutableRefObject<HTMLDivElement>;

    const router = useRouter()
    const channelId = router.query.id as string;

    const { data, isLoading, isError, error, fetchNextPage, hasNextPage } = useInfiniteQuery(
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

    if (isLoading) {
        return (
            <div className={style.page}>
                loading...
            </div>
        )
    }

    if (isError) {
        console.log(error)

        return <div className={style.page}>neco se pokazilo</div>
    }

    return (
        <div className={style.page}>
            <div className={`${style.chat_box} ${style.scroll}`} onScroll={onScroll} ref={messageRef} onLoad={fetchMore} >
                {data?.pages.map((group, i) => {
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
                })}
            </div>
        </div>
    )
}

DmPage.getLayout = function (page: ReactElement) {
    return <ChannelLayout>{page}</ChannelLayout>
}

export default DmPage;