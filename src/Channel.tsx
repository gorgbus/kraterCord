import { FC, Fragment, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "react-query";
import Message from "./components/Message";
import { fetchMessages } from "./utils/api";
import "./styles/channel.css";
import { addMessage, isCompact, isLast } from "./utils";
import { useChannel } from "./store/channel";
import { useSocket } from "./store/socket";
import { infQuery } from "./utils/types";
import { useNotification } from "./store/notification";
import { useUser } from "./store/user";

const Channel: FC<{ dm?: boolean }> = ({ dm }) => {
    const channel = useChannel(state => state.channel);
    const user = useUser(state => state.user);
    const socket = useSocket(state => state.socket);
    const notifications = useNotification(state => state.notifications);
    const removeNotification = useNotification(state => state.removeNotification);
    const addNotification = useNotification(state => state.addNotification);

    const notification = notifications.find(n => n.channel === channel);

    if (notification) {
        removeNotification(channel);
        
        socket?.emit('notif_rm', channel, user._id);
    }

    const queryClient = useQueryClient();

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

    useEffect(() => {
        socket?.on("new_message", (data) => {
            const cache = queryClient.getQueryData<infQuery>(["channel", data.id]);

            const newCache = addMessage(data.msg, cache);
            if (!newCache) return;

            queryClient.setQueryData(["channel", channel], newCache);

            if (channel !== data.id) socket.emit('create_notif', {
                channel: data.id,
                guild: data.guild || null
            });

            addNotification({
                channel: data.id,
                guild: data.guild || null,
                createdOn: new Date(Date.now()),
            });
        });
    }, []);

    return (
        <div className={`bg-gray-700 h-[calc(100vh_-_132px)] ${dm ? `w-[calc(100vw_-_300px)]` : `w-[calc(100vw_-_523px)]`} mt-12`}>
            <div onScroll={onScroll} onLoad={fetchMore} className="flex flex-col-reverse h-full overflow-scroll overflow-x-hidden messages" >
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