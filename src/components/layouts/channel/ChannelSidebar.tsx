import { FC } from "react";
import { Link, Outlet } from "react-router-dom";
import { useChannel } from "../../../store/channel";
import { useGuild } from "../../../store/guild";
import { useNotification } from "../../../store/notification";
import ChannelBar from "./ChannelBar";
import ChatInput from "../ChatInput";
import MemberSidebar from "./MemberSidebar";
import UserProfile from "../UserProfile";

const ChannelSidebar: FC = () => {
    const channel = useChannel(state => state.channel);
    const channels = useChannel(state => state.channels);
    const guild = useGuild(state => state.guild);
    const notifications = useNotification(state => state.notifications);

    const setChannel = useChannel(state => state.setChannel);

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
                            channels.filter(ch => ch.guild === guild._id && ch.type !== 'voice').map((ch, i) => {
                                const notification = notifications.find(n => n.channel === ch._id);

                                return (
                                    <Link onClick={() => setChannel(ch._id)} key={i} to={`/channels/${guild._id}/${ch._id}`} className={`${channel === ch._id ? `bg-gray-500` : notification && `font-semibold`} relative item ml-1 text-gray-300`} >
                                        <span className="text-xl font-bold text-gray-300 uppercase">#</span>
                                        <span className="ml-2">{ch.name}</span>
                                        {notification && channel !== ch._id && <span className="absolute w-2 h-2 -translate-y-1/2 bg-white rounded-lg top-1/2 -left-[11px]"></span>}
                                    </Link>
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