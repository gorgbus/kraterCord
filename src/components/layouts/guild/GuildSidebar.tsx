import { Stream } from "form-data";
import Image from "next/image";
import { useRouter } from "next/router";
import Peer from "peerjs";
import { FC, MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { BsHash } from "react-icons/bs";
import { IoMdVolumeHigh } from "react-icons/io";
import { useQuery } from "react-query";
import { fetchGuildChannels } from "../../../utils/api";
import { PEERJS_HOST, PEERJS_PORT } from "../../../utils/constants";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";
import { UserContext } from "../../../utils/contexts/UserContext";
import { channel, member } from "../../../utils/types";
import style from "./channelLayout.module.scss";

const GuildSidebar: FC = () => {
    const { channels, setChannel, channel, setScroll, setChannels, socket } = useContext(ChannelContext);
    const { user } = useContext(UserContext);

    const router = useRouter();
    const audioRef = useRef() as MutableRefObject<HTMLAudioElement>;

    const guildId = router.query._id as string;
    const channelId = router.query.id as string;

    const { data, isFetched, isSuccess, isError } = useQuery(["guild", guildId], () => fetchGuildChannels(guildId));

    const [_peer, setPeer] = useState<Peer>();

    const handleRedirect = async (chnl: channel) => {
        if (chnl.type === "voice") return handleJoin(chnl);

        setScroll([false, false]);
        setChannel(chnl);
        router.push(`/channels/[_id]/[id]`, `/channels/${chnl?.guild}/${chnl?._id}`, { shallow: true });
    }

    const handleJoin = async (chnl: channel) => {
        if (chnl.users?.find(usr => usr._id === user?._id)) return;
        const Peer = (await import("peerjs")).default;

        const peer = new Peer(user?._id, {
            host: PEERJS_HOST,
            path: "peerjs"
        });

        setPeer(peer);

        peer.on("open", () => {
            socket?.emit("join_channel", chnl._id, user);
        });

        let stream: MediaStream;

        navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
        }).then((data) => {
            stream = data;
        });

        socket?.on("join_success", (id, _user) => {
            const call = peer.call(_user._id, stream);
            const audio = new Audio()

            call.on("stream", (userStream) => {
                audio.srcObject = userStream;
                audio.play();
            });

            call.on("close", () => {
                audio.remove();
            });
        });

        peer.on("call", call => {
            call.answer(stream);

            call.on("stream", (userStream) => {
                const newAudio = new Audio()
                newAudio.srcObject = userStream;
                newAudio.play();
            });
        });
    }

    const updateChannels = (_user: member, id: string) => {
        let voice = channels?.filter(chnl => chnl._id === id);
        let index: number = -1;

        if (voice && channels) {
            index = channels.indexOf(voice[0]);

            if (voice[0].users.includes(_user!)) return;

            voice[0].users ? voice[0].users.push(_user!) : voice[0].users = [_user!];
        }
        
        if (index != -1 && channels && voice) {
            const newChannels: channel[] = channels;
            newChannels[index] = voice[0];

            setChannels(newChannels);

            router.push(`/channels/[_id]/[id]`, `/channels/${guildId}/${channelId}`, { shallow: true });
        }
    }

    useEffect(() => {
        socket?.on("joined_success", (id) => {
            updateChannels(user!, id);
        });

        socket?.on("joined_channel", (id, _user) => {
            updateChannels(_user, id);
        });

        socket?.on("user_disconnected", (id, _user) => {
            const voice = channels?.filter(chnl => chnl._id === id);

            if (voice) {
                const i = channels?.indexOf(voice[0]);
                const newChannels: channel[] = channels!;
                const filter = (element: member) => element._id === _user._id;
                const index = newChannels[i!].users.findIndex(filter);

                if (index != -1) {
                    newChannels[i!].users.splice(index, 1);

                    setChannels(newChannels);
                    router.push(`/channels/[_id]/[id]`, `/channels/${guildId}/${channelId}`, { shallow: true });
                }
                
            }
        });
    });

    if (isError) {
        return <div>Error</div>;
    }

    if (isFetched) {
        setChannels(data);
    }

    if (isSuccess) {
        return (
            <div className={style.sidebar}>
                <div className={style.channels}>
                    {data?.map((chnl: channel, i: number) => {
                        return (
                            <div key={i}>
                                <div className={`${style.channel} ${chnl === channel ? `${style.sel_channel}` : `${style.nosel_channel}`}`} onClick={() => handleRedirect(chnl)}>
                                    {
                                        chnl.type === "text" ?
                                            <div className={style.channel_name}>
                                                <BsHash size={24}/>
                                                <span>{chnl.name}</span>
                                            </div>
                                        :
                                            (
                                                <div>
                                                    <div className={style.channel_name}>
                                                        <IoMdVolumeHigh size={22} />
                                                        <span>{chnl.name}</span>
                                                    </div>
                                                </div>
                                            )
                                            
                                    }
                                </div>

                                {chnl.users?.map((user, i) => {
                                    return (
                                        <div key={i} className={style.user}>
                                            <Image src={user.avatar} width={22} height={22} className={style.avatar} />
                                            <span>{user.username}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return <div>Error</div>;
}

export default GuildSidebar;