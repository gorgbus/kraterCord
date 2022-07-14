import { FC, Fragment } from "react";
import { useInfiniteQuery } from "react-query";
import Message from "./Message";
import { fetchMessages } from "../../utils/api";
import { isCompact, isLast } from "../../utils";
import { useChannel } from "../../store/channel";

const Channel: FC<{ dm?: boolean }> = ({ dm }) => {
    const channel = useChannel(state => state.channel);

    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isSuccess } = useInfiniteQuery(
        ["channel", channel],
        ({ pageParam = 0 }) => fetchMessages(channel, pageParam),
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
                            <Fragment key={i}>
                                {
                                    group.messages.map((msg, i) => {
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