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
    const { guilds, setSocket, socket, setScroll, setChannelType, channel, setChannel } = useContext(ChannelContext);
    const { user, setFriendReqs, friendReqs, friends, setFriends, dms, setDms, setNotifs, notifs, setUsers, users } = useContext(UserContext);

    const router = useRouter();
    const queryClient = useQueryClient();

    const guildId = router.query._id as string;
    const curGuild = guildId ? guildId : undefined;

    const openGuild = (guild: guild) => {
        setChannelType("guild");
        router.push(`/channels/[_id]/[id]`, `/channels/${guild._id}/${guild.firstChannel}`, { shallow: true });
    }

    useEffect(() => {
        if (!socket) {
            const _socket = io(SOCKET_ENDPOINT);
            setSocket(_socket);

            _socket.emit("setup", user?._id, user);

            _socket.on("online", (_user: member) => {
                const index = users.findIndex(u => u._id === _user._id);
                let temp = users

                if (index !== -1) {
                    temp[index] = _user;
                } else {
                    temp.push(_user);
                }

                setUsers(temp);
                router.push(window.location.pathname, window.location.pathname, { shallow: true });
            });

            _socket.on("new_message", (data) => {
                const cache = queryClient.getQueryData<infQuery>(["channel", data.id]);

                if (!document.hasFocus() || channel?._id != data.id) {
                    if (data.msg.author._id === user?._id) return;

                    const audio = new Audio();
                    audio.src = "https://storage.googleapis.com/krater/krater-msg-faster.mp3";
                    audio.play();
                    audio.onended = () => audio.remove();

                    if (notifs.find(nf => nf.channel === data.id)) {
                        _socket.emit("create_notif", {
                            guild: data.guild,
                            channel: data.id,
                            count: 1,
                            user: user?._id,
                        });

                        const index = notifs.findIndex(nf => nf.channel === data.id);
                        let temp = notifs;
                        temp[index].count++;
                        setNotifs(temp);

                        router.push(window.location.pathname, window.location.pathname, { shallow: true });
                    } else {
                        _socket.emit("create_notif", {
                            guild: data.guild,
                            channel: data.id,
                            count: 1,
                            user: user?._id,
                        });

                        const notif = {
                            guild: data.guild,
                            channel: data.id,
                            count: 1,
                            createdOn: new Date(Date.now()),
                        }

                        notifs.push(notif);

                        setNotifs(notifs);
                        router.push(window.location.pathname, window.location.pathname, { shallow: true });
                    }
                }

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
            {
                notifs.map((nf, i) => {
                    const dm = dms.find(dm => dm._id === nf.channel);

                    return (
                        (!nf.guild) &&
                            <div key={i} className={style.notif} onClick={
                                () => {
                                    setChannelType("dm");
                                    setChannel(dms.find(ch => ch._id === nf.channel)!);
                                    router.push(`/channels/@me/[id]`, `/channels/@me/${nf.channel}`, { shallow: true });
                                }}>
                                <div className={style.sel_icon}/>
                                <div className={style.count}>
                                    <span>{nf.count}</span>
                                </div>
                                <Image className={style.avatar} width={48} height={48} src={dm?.users[0]._id === user?._id ? dm?.users[1].avatar! : dm?.users[0].avatar!}></Image>
                            </div>
                    )
                })
            }

            <div className={`${style.home} ${curGuild ? `` : style.active_home}`} onClick={() => {
                setChannelType("dm");
                router.push("/channels/@me", "/channels/@me", { shallow: true })
            }} >
                <div className={style.sel_icon}/>
                <HiHome size={26} className={style.icon}/>
            </div>

            {
                guilds?.map((guild, i) => {
                    return (
                        <div key={i} className={`${style.guild} ${curGuild === guild._id ? style.active_guild : ``} ${notifs.find(nf => nf.guild === guild._id) && curGuild != guild._id ? style.notif_icon : ``}`} onClick={() => openGuild(guild)}>
                            <div className={style.sel_icon}/>
                            <Image className={style.avatar} src={guild.avatar} height={48} width={48} />
                        </div>
                    )
                })
            }
        </div>
    )
}

export default Sidebar;