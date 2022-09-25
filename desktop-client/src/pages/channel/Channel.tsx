import { FC, Fragment } from "react";
import { useInfiniteQuery } from "react-query";
import Message from "./Message";
import { fetchMessages } from "../../utils/api";
import { isCompact, isLast } from "../../utils";
import { useParams } from "react-router-dom";

const Channel: FC<{ dm?: boolean }> = ({ dm }) => {
    const { channelId } = useParams();

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
        <div className={`bg-gray-700 h-[calc(100vh_-_132px)] ${dm ? `w-[calc(100vw_-_300px)]` : `w-[calc(100vw_-_524px)]`} mt-12`}>
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

export default Channel;