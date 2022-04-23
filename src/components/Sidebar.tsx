import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useContext, useEffect } from "react";
import { useQueryClient } from "react-query";
import { io } from "socket.io-client";
import { SOCKET_ENDPOINT } from "../utils/constants";
import { ChannelContext } from "../utils/contexts/ChannelContext";
import { UserContext } from "../utils/contexts/UserContext";
import { guild, infQuery, member } from "../utils/types";
import { HiHome } from "react-icons/hi";
import style from "./sidebar.module.scss";

const Sidebar: FC = () => {
    const { guilds, setSocket, socket, setScroll, setChannelType } = useContext(ChannelContext);
    const { user, setFriendReqs, friendReqs, friends, setFriends, dms, setDms } = useContext(UserContext);

    const router = useRouter();
    const queryClient = useQueryClient();

    const openGuild = (guild: guild) => {
        setChannelType("guild");
        router.push(`/channels/[_id]/[id]`, `/channels/${guild._id}/${guild.firstChannel}`, { shallow: true });
    }

    useEffect(() => {
        if (!socket) {
            const _socket = io(SOCKET_ENDPOINT);
            setSocket(_socket);

            _socket.emit("setup", user?._id);

            _socket.on("new_message", (data) => {
                const cache = queryClient.getQueryData<infQuery>(["channel", data.id]);

                if (cache) {
                    const messages = cache.pages[0].messages;
                    if (messages.length < 20) {
                        messages.unshift(data.msg);
                    } else {
                        let lastEl = messages[messages.length - 1];
                        messages.unshift(data.msg);
                        messages.pop();

                        for (const page of cache.pages) {
                            if (page === cache.pages[cache.pages.length - 1] && page.messages.length === 20) {
                                cache.pages.push({ messages: [lastEl], nextId: page.nextId });
                                break;
                            }

                            if (page === cache.pages[0]) continue;

                            if (page.messages.length < 20) {
                                page.messages.unshift(lastEl);
                                break;
                            }

                            page.messages.unshift(lastEl);
                            lastEl = page.messages[page.messages.length - 1];
                            page.messages.pop();
                        }
                    }

                    setScroll([scroll[0], false]);
                    queryClient.setQueryData(["channel", data.id], cache);
                }
            });

            _socket.on("fr_accepted", (fr: member) => {
                if (user?._id === fr._id) return;

                setFriendReqs(friendReqs.filter(f => f.friend._id !== fr._id));
                setFriends([...friends, fr]);
            });

            _socket.on("fr_declined", (fr: member) => {
                if (user?._id === fr._id) return;

                setFriendReqs(friendReqs.filter(f => f.friend._id !== fr._id));
            });

            _socket.on("fr_reqd", (fr: member) => {
                if (user?._id === fr._id) return;
                
                setFriendReqs([...friendReqs, { friend: fr, type: "in" }]);
            });

            _socket.on("fr_removed", (fr: member) => {
                if (user?._id === fr._id) return;

                setFriends(friends.filter(f => f._id !== fr._id));
            });

            _socket.on("dm_created", (dm) => {
                setDms([...dms, dm]);
            })
        }

    }, []);

    return (
        <div className={style.container}>
            <div className={style.home} onClick={() => {
                setChannelType("dm");
                router.push("/channels/@me", "/channels/@me", { shallow: true })
            }} >
                <HiHome size={26} className={style.icon}/>
            </div>
            {
                guilds?.map((guild, i) => {
                    return (
                        <div key={i} className={style.guild} onClick={() => openGuild(guild)}>
                            <Image className={style.avatar} src={guild.avatar} height={48} width={48} />
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Sidebar;