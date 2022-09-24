import { FC, ReactElement, ReactNode, useEffect, useState } from "react";
import ChannelBar from "./ChannelBar";
import ChatInput from "../ChatInput";
import MemberSidebar from "./MemberSidebar";
import UserProfile from "../UserProfile";
import { ChannelIcon, CloseIcon, DeafenHeadphoneIcon, DropDownIcon, InviteIcon, LoadingIcon, MutedMicIcon, SettingsIcon, VoiceChannelIcon } from "../../ui/Icons";
import { Channel, User, useUser } from "../../../store/user";
import { useSocket } from "../../../store/socket";
import { connectToChannel } from "../../../utils/vcLogic";
import { useSettings } from "../../../store/settings";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { fetchChannels, getGuildInvite, createMessage, createChannel, joinChannel } from "../../../utils/api";
import Modal from '../../ui/Modal';
import { useRouter } from "next/router";
import Image from "next/future/image";

const ChannelSidebar = ({ children }: { children: ReactElement }) => {
    const router = useRouter();
    const { guildId, channelId } = router.query;

    const userId = useUser(state => state.user.id);
    const username = useUser(state => state.user.username);
    const avatar = useUser(state => state.user.avatar);
    const notifications = useUser(state => state.user.notifications);
    const guilds = useUser(state => state.user.guilds);
    const socket = useSocket(state => state.socket);
    const voice = useSettings(state => state.voiceChannel);
    const setVoice = useSettings(state => state.setVoiceChannel);
    const setVoiceGuild = useSettings(state => state.setVoiceGuild);

    const getDeafen = useSettings(state => state.getDeafen);
    const getMuted = useSettings(state => state.getMuted);
    const talkingUsers = useSettings(state => state.talkingUsers);

    const guildName = guilds.find(gld => gld.id === guildId)?.name;

    const [guildSettings, showSettings] = useState(false);
    const [invite, openInvite] = useState(false);

    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery(['channels', guildId], () => fetchChannels(guildId as string));

    const { mutate } = useMutation(joinChannel, {
        onMutate: async (channel) => {
            await queryClient.cancelQueries(["channels", guildId]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", guildId]);

            if (!cache) return;

            const user = {
                id: userId,
                username,
                avatar,
                muted: getMuted(),
                deafen: getDeafen(),
            }

            const newCache = cache;

            const index = newCache.findIndex(chnl => chnl.id === channel.channelId);

            if (index === -1) return;

            newCache[index].members = [...newCache[index].members, user as User];

            queryClient.setQueryData(["channels", guildId], newCache);

            return { cache };
        },
        onError: (_error, _data, context: any) => {
            queryClient.setQueryData(["channels", guildId], context.cache);
        },
        onSettled: () => {
            queryClient.invalidateQueries(["channels", guildId]);
        }
    });

    const join = (id: string, user?: User) => {
        if (id === voice || user) return;

        setVoice(id);
        setVoiceGuild(guildId as string);
        
        mutate({
            channelId: id,
            deafen: getDeafen(),
            muted: getMuted()
        });

        connectToChannel(id);
    }

    return (
        <div className="flex w-full h-full">
            <div className="relative flex flex-col w-56 h-full bg-gray-800 rounded-tl-md">
                <ChannelBar />

                <div onClick={() => showSettings(prev => !prev)} className={`${guildSettings ? 'bg-gray-600' : 'bg-gray-800'} font-bold rounded-tl-md fixed uppercase border-b-[1px] border-gray-900 flex items-center justify-center w-56 h-12 hover:bg-gray-600 cursor-pointer transition-all`}>
                    <div className="flex items-center justify-between w-52">
                        <span className="overflow-hidden text-xs text-gray-100 w-44 whitespace-nowrap text-ellipsis">{guildName}</span>
                        {guildSettings ? <CloseIcon size="16" color="text-gray-100" /> : <DropDownIcon size="20" color="text-gray-100" />}
                    </div>
                </div>

                {
                    guildSettings && <GuildSettings openInvite={() => openInvite(true)} hide={() => showSettings(false)} />
                }

                {
                    invite &&
                        <Modal close={() => openInvite(false)} size="w-96" content={<InviteModal />} />
                }

                <div className="w-full mt-12 h-[calc(100%_-_96px)] overflow-scroll overflow-x-hidden bg-gray-800 thin-scrollbar">
                    <div className="flex flex-col items-center">
                        {
                            isLoading &&
                                <span>loading...</span>
                        }

                        {
                            isError &&
                                <span>error</span>
                        }

                        {
                            data &&
                                data.filter(ch => ch.guildId === guildId && ch.type === 'TEXT').map((ch) => {
                                    const notification = notifications.find(n => n.channelId === ch.id);

                                    return (
                                        <div key={ch.id} onClick={() => router.push(`/channels/${guildId}/${ch.id}`)} className={`${channelId === ch.id ? `bg-gray-500 cursor-pointer text-gray-100` : notification ? `font-semibold text-gray-100` : `text-gray-300`} relative item ml-1 hover:text-gray-100`} >
                                            <ChannelIcon size='20' color="text-gray-300" />
                                            <span className="ml-2">{ch.name}</span>
                                            {notification && channelId !== ch.id && <span className="absolute w-2 h-2 -translate-y-1/2 bg-white rounded-lg top-1/2 -left-[11px]"></span>}
                                        </div>
                                    )
                                })
                        }

                        {   
                            data &&
                                data.filter(ch => ch.guildId === guildId && ch.type === 'VOICE').map((ch) => {
                                    const user = ch.members?.find(user => user.id === userId);

                                    return (
                                        <div key={ch.id} className="flex flex-col">
                                            <div onClick={() => join(ch.id, user)} key={ch.id} className={`${voice === ch.id || user ? 'cursor-not-allowed' : 'cursor-pointer'} relative item ml-1 text-gray-300 hover:text-gray-100`} >
                                                <VoiceChannelIcon size='20' color="text-gray-300" />
                                                <span className="ml-2">{ch.name}</span>
                                            </div>

                                            <ul>
                                                {
                                                    ch.members?.map((u) => {
                                                        const talking = talkingUsers.find(id => id === u.id);

                                                        return (
                                                            <li key={u.id} className='flex items-center justify-between p-1 rounded-md ml-9 w-44 group hover:bg-gray-600' >
                                                                <div className={`flex items-center ${!u.muted && !u.deafen ? 'w-[calc(100%-4px)]' : u.deafen ? 'w-[calc(100%-36px)]' : 'w-[calc(100%-18px)]'}`}>
                                                                    <Image className={`rounded-full ${talking && voice !== 'none' && !u.muted ? 'border-2 border-green-500 w-6 h-6' : 'w-5 h-5 m-[2px]'}`} width={24} height={24} src={u.avatar} alt={u.username} />
                                                                    <span className={`ml-2 text-xs w-full whitespace-nowrap text-ellipsis overflow-hidden text-gray-400 group-hover:text-gray-100`}>{u.username}</span>
                                                                </div>

                                                                <div className="flex items-center">
                                                                    {u.muted && <MutedMicIcon size="14" color="text-gray-400 ml-1" strikeColor="text-gray-400" />}
                                                                    {u.deafen && <DeafenHeadphoneIcon size="14" color="text-gray-400 ml-1" strikeColor="text-gray-400"/>}
                                                                </div>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                        </div>
                                    )
                                })
                        }
                    </div>
                </div>

                <UserProfile />
            </div>

            <div className="flex flex-col">
                {children}

                <ChatInput />
            </div>
            
            <MemberSidebar />
        </div>
    )
}

export default ChannelSidebar;

const GuildSettings: FC<{ hide: () => void; openInvite: () => void; }> = ({ hide, openInvite }) => {
    const [settings, openSettings] = useState(false);

    return (
        <div className="absolute z-10 bg-gray-900 left-[7px] top-12 mt-1 w-52 rounded-md text-gray-300 flex items-center justify-center">
            <div className="flex flex-col w-48 last:mb-2">
                <SettingOption onClick={() => {openInvite(); hide()}} title="Pozvat lidi" titleStyle="text-blue-500" icon={<InviteIcon size="16" color="text-blue-500 group-hover:text-gray-100" />} />
                <SettingOption onClick={() => openSettings(true)} title="Nastavení serveru" icon={<SettingsIcon size="16" color="text-gray-300 group-hover:text-gray-100" />} />
            </div>
        </div>
    )
}

const SettingOption: FC<{ title: string; titleStyle?: string; icon: ReactNode; onClick: () => void; }> = ({ title, titleStyle, icon, onClick }) => {
    return (
        <div onClick={onClick} className="flex items-center justify-between w-48 h-6 p-2 mt-2 rounded cursor-pointer hover:bg-blue-500 group">
            <span className={`text-sm group-hover:text-gray-100 ${titleStyle}`}>{title}</span>
            {icon}
        </div>
    )
}

const InviteModal: FC = () => {
    const { guildId } = useRouter().query;

    const friends = useUser(state => state.user.friends);
    const guilds = useUser(state => state.user.guilds);
    const guild = guilds.find(guild => guild.id === guildId);
    const dms = useUser(state => state.user.dms);
    const addDM = useUser(state => state.addDM);
    const userId = useUser(state => state.user.id);
    const socket = useSocket(state => state.socket);

    const [code, setCode] = useState('');
    const [send, setSend] = useState<{ friendId: string; sending: boolean; }[]>([]);

    const copy = () => {
        navigator.clipboard.writeText(`https://krater-cord.tech/invite/${code}`)
    }

    const sendInvite = async (friendId: string) => {
        const dm = dms.find(dm => dm.users.find(user => user.id === friendId));

        let newDM;

        if (!dm) {
            newDM = await createChannel([{ id: userId }, { id: friendId }], 'DM', 'dm channel')

            if (!newDM) return;

            addDM(newDM);
        }

        if (!newDM && !dm) return;

        setSend(prev => [...prev, { friendId, sending: true }]);

        const message = await createMessage({ channelId: dm ? dm.id : newDM?.id!, authorId: userId, content: `https://krater-cord.tech/invite/${code}` });

        if (!message) return;

        setSend(prev => prev.map(user => user.friendId === friendId ? { friendId, sending: false } : user));

        socket?.emit('create_message_dm', friendId, {
            id: dm ? dm.id : newDM?.id,
            msg: message,
        });
    }

    useEffect(() => {
        (async () => {
            const inviteCode = await getGuildInvite(guildId as string);

            if (!inviteCode) return;

            setCode(inviteCode);
        })();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="w-[90%] mt-4">
                <h2 className="font-semibold text-gray-100">Pozvat přátelé do <span className="font-bold">{guild?.name}</span></h2>
            </div>

            {
                friends.length > 0 &&
                    <div className="w-full border-t-[1px] border-b-[1px] mt-2 max-h-32 border-t-gray-800 border-b-gray-800 flex flex-col overflow-y-scroll overflow-x-hidden thin-scrollbar">
                        {
                            friends.map((friend, i) => {
                                const user = send.find(user => user.friendId === friend.id);

                                return (
                                    <div className="flex items-center justify-between p-1 m-1 ml-2 rounded group hover:bg-gray-600" key={i}>
                                        <div className="flex items-center w-[90%] h-12 ml-2">
                                            <Image src={friend.avatar} alt={friend.username} width={32} height={32} className="rounded-full" />
                                            <span className="ml-2 font-semibold text-gray-100">{friend.username}</span>
                                        </div>

                                        <button onClick={() => sendInvite(friend.id)} disabled={code.length === 0 || !!user} className={`${user && !user.sending ? 'text-gray-300' : 'border-green-600 border-2 group-hover:bg-green-600 group-hover:border-green-600 hover:bg-green-700 hover:border-green-700 text-gray-100'} pl-1 pr-1 mr-2 bg-transparent rounded disabled:cursor-not-allowed `}>{user ? user.sending ? <LoadingIcon size="16" color="text-gray-300" /> : 'Odesláno' : 'Pozvat'}</button>
                                    </div>
                                )
                            })
                        }
                    </div>
            }

            <div className="w-[90%] mt-2 mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">nebo pošli odkaz s pozvánkou na server</h3>
                <div className="flex items-center justify-between w-full h-8 mt-1 bg-gray-900 rounded">
                    <span className="ml-1 text-sm text-gray-400">{code.length === 0 ? 'loading...' : `https://krater-cord.tech/invite/${code}`}</span>
                    <button disabled={code.length === 0} onClick={copy} className="w-20 h-6 mr-1 text-sm font-semibold text-gray-100 bg-blue-500 rounded cursor-copy">Kopírovat</button>
                </div>
            </div>
        </div>
    )
}