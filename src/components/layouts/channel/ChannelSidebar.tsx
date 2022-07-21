import { FC } from "react";
import { Link, Outlet } from "react-router-dom";
import { useChannel } from "../../../store/channel";
import { useGuild } from "../../../store/guild";
import { useNotification } from "../../../store/notification";
import ChannelBar from "./ChannelBar";
import ChatInput from "../ChatInput";
import MemberSidebar from "./MemberSidebar";
import UserProfile from "../UserProfile";
import { ChannelIcon, DeafenHeadphoneIcon, MutedMicIcon, VoiceChannelIcon } from "../../ui/Icons";
import { useUser } from "../../../store/user";
import { useSocket } from "../../../store/socket";
import { loadDevice } from "../../../utils/vcLogic";
import Img from "react-cool-img";
import { useSettings } from "../../../store/settings";

const ChannelSidebar: FC = () => {
    const channel = useChannel(state => state.channel);
    const channels = useChannel(state => state.channels);
    const guild = useGuild(state => state.guild);
    const notifications = useNotification(state => state.notifications);
    const user = useUser(state => state.user);
    const users = useUser(state => state.users);
    const socket = useSocket(state => state.socket);
    const voice = useChannel(state => state.voice);

    const setChannel = useChannel(state => state.setChannel);
    const setVoice = useChannel(state => state.setVoice);
    const setVoiceGuild = useChannel(state => state.setVoiceGuild);
    const addUser = useChannel(state => state.addUser);

    const getDeafen = useSettings(state => state.getDeafen);
    const getMuted = useSettings(state => state.getMuted);

    const joinChannel = (id: string, userMember: any) => {
        if (id === voice || userMember) return;

        setVoice(id);
        setVoiceGuild(guild._id);
        addUser(id, user._id, getMuted(), getDeafen());

        socket?.emit('ms_setup', id, loadDevice);
    }

    return (
        <div className="flex w-full h-full">
            <div className="relative flex flex-col w-56 h-full bg-gray-800 rounded-tl-md">
                <ChannelBar />

                <div className="bg-gray-800 font-bold rounded-tl-md text-white fixed uppercase border-b-[1px] border-gray-900 flex items-center w-56 h-12">
                    <span className="ml-2">{guild.name}</span>
                </div>

                <div className="w-full mt-12 h-[calc(100%_-_96px)] overflow-scroll overflow-x-hidden bg-gray-800 thin-scrollbar">
                    <div className="flex flex-col items-center">
                        {
                            channels.filter(ch => ch.guild === guild._id && ch.type !== 'voice').map((ch) => {
                                const notification = notifications.find(n => n.channel === ch._id);

                                return (
                                    <Link onClick={() => setChannel(ch._id)} key={ch._id} to={`/channels/${guild._id}/${ch._id}`} className={`${channel === ch._id ? `bg-gray-500 text-gray-100` : notification ? `font-semibold text-gray-100` : `text-gray-300`} relative item ml-1 hover:text-gray-100`} >
                                        <ChannelIcon size='20' color="text-gray-300" />
                                        <span className="ml-2">{ch.name}</span>
                                        {notification && channel !== ch._id && <span className="absolute w-2 h-2 -translate-y-1/2 bg-white rounded-lg top-1/2 -left-[11px]"></span>}
                                    </Link>
                                )
                            })
                        }

                        {
                            channels.filter(ch => ch.guild === guild._id && ch.type === 'voice').map((ch) => {
                                const userMember = ch.users?.find(u => u.user === user._id);

                                return (
                                    <div className="flex flex-col">
                                        <div onClick={() => joinChannel(ch._id, userMember)} key={ch._id} className={`${voice === ch._id || userMember ? 'cursor-not-allowed' : 'cursor-pointer'} relative item ml-1 text-gray-300 hover:text-gray-100`} >
                                            <VoiceChannelIcon size='20' color="text-gray-300" />
                                            <span className="ml-2">{ch.name}</span>
                                        </div>

                                        <ul>
                                            {
                                                ch.users?.map((u) => {
                                                    const member = users.find(usr => usr._id === u.user);

                                                    return (
                                                        <li key={u.user} className='flex items-center justify-between p-1 ml-10 rounded-md group hover:bg-gray-600' >
                                                            <div className="flex items-center">
                                                                <Img className='w-6 h-6 rounded-full' src={member?.avatar} />
                                                                <span className='ml-2 text-sm text-gray-400 group-hover:text-gray-100'>{member?.username}</span>
                                                            </div>

                                                            <div className="flex items-center">
                                                                {u.muted && <MutedMicIcon size="16" color="text-gray-400" strikeColor="text-gray-400" />}
                                                                {u.deafen && <DeafenHeadphoneIcon size="16" color="text-gray-400 ml-1" strikeColor="text-gray-400"/>}
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
                <Outlet />

                <ChatInput />
            </div>
            
            <MemberSidebar />
        </div>
    )
}

export default ChannelSidebar;