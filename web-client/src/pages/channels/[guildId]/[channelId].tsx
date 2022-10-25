import { Fragment, ReactElement } from "react";
import { useInfiniteQuery } from "react-query";
import Message from "../../../components/ui/Message";
import { fetchMessages } from "@kratercord/common/api";
import useUtil from "@kratercord/common/hooks/useUtil";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../../utils/types";
import ChannelSidebar from "../../../components/layouts/channel/ChannelSidebar";

const Channel: NextPageWithLayout<{ dm?: boolean }> = ({ dm }) => {
    const { channelId } = useRouter().query;

    const { isCompact, isLast } = useUtil();

    const { data, fetchNextPage, hasNextPage, isSuccess } = useInfiniteQuery(
        ["channel", channelId],
        ({ pageParam = 'first' }) => fetchMessages(channelId as string, pageParam),
        {
            getNextPageParam: (lastPage) => {
                if (lastPage.nextId === 'undefined') 
                    return undefined;
                
                return lastPage.nextId;
            }
        }
    );

    const onScroll = (event: any) => {
        const target = event.currentTarget as HTMLDivElement;

        if ((target.clientHeight - target.scrollHeight) === target.scrollTop && hasNextPage) {
            fetchNextPage();
        }
    }

    const fetchMore = (event: any) => {
        const target = event.currentTarget as HTMLDivElement;

        if (target.clientHeight === target.scrollHeight && hasNextPage) {
            fetchNextPage();
        }
    }

    return (
        <div className={`bg-gray-700 h-[calc(100vh-112px)] ${dm ? `w-[calc(100vw-300px)]` : `w-[calc(100vw-524px)]`} mt-12`}>
            <div onScroll={onScroll} onLoad={fetchMore} className="flex flex-col-reverse h-full overflow-scroll overflow-x-hidden scrollbar" >
                {
                    isSuccess && data.pages.map((group, i) => {
                        return (
                            group && <Fragment key={i}>
                                {
                                    group.messages.map((msg, i) => {
                                        if (!data.pages) return;

                                        const compact = isCompact(data.pages, group, msg, i);
                                        const last = isLast(data.pages, group, msg, i);
                                            
                                        return (
                                            <Message key={i} msg={msg} compact={compact} last={last}/>
                                        )
                                    })
                                }
                            </Fragment>
                        )
                    })
                }
            </div>
        </div>
    )
}

Channel.getLayout = (page: ReactElement) => {
    return <ChannelSidebar>{page}</ChannelSidebar>
}

Channel.app = true;

export default Channel;