import { Fragment, FC } from "react";
import { useInfiniteQuery } from "react-query";
import Message from "./Message";
import { fetchMessages } from "@kratercord/common/api";
import useUtil from "@kratercord/common/hooks/useUtil";
import { BaseProps } from "../types";
import { useSettings } from "../store/settings";

interface Props extends BaseProps {
    dm?: boolean
}

const Channel: FC<Props> = ({ dm, Image, navigate, params }) => {
    const { channelId } = params;

    const { isCompact, isLast } = useUtil();

    const web = useSettings(state => state.web);

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
        <div className={`bg-gray-700 ${web ? "h-[calc(100vh_-_112px)]" : "h-[calc(100vh_-_132px)]"} ${dm ? `w-[calc(100vw_-_300px)]` : `w-[calc(100vw_-_524px)]`} mt-12`}>
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
                                            <Message params={params} navigate={navigate} Image={Image} key={i} msg={msg} compact={compact} last={last} />
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