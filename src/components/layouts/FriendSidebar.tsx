import { FC } from "react";
import Img from "react-cool-img";
import { Link, Outlet } from "react-router-dom";
import { useChannel } from "../../store/channel";
import { useUser } from "../../store/user";
import ChannelBar from "../ChannelBar";
import ChatInput from "../ChatInput";
import FriendBar from "../FriendBar";
import { AddIcon, CloseIcon, FriendIcon } from "../Icons";

const FriendSidebar: FC = () => {
    const channel = useChannel(state => state.channel);
    const channels = useChannel(state => state.channels);
    const setChannel = useChannel(state => state.setChannel);
    const user = useUser(state => state.user);
    const users = useUser(state => state.users);

    return (
        <div className="inline-flex w-full h-full">
            <div className="flex flex-col w-56 h-full overflow-auto overflow-x-hidden bg-gray-800 rounded-tl-md">
                {channel === "none" && <FriendBar />}
                {channel !== "none" && channel && <ChannelBar />}

                <div className="bg-gray-800 font-bold rounded-tl-md text-white fixed uppercase border-b-[1px] border-gray-900 flex items-center w-56 h-12">
                    <input disabled={true} className="w-full h-6 p-1 m-2 text-xs rounded-sm cursor-pointer bg-slate-900 placeholder:text-gray-300 focus:outline-none" type="text" placeholder="Najít nebo začít konverzaci" />
                </div>

                <div className="mt-12 w-ful h-[100%_-_48px] flex flex-col items-center">
                    <Link onClick={() => setChannel('none')} to={'/channels/@me'} className="flex items-center p-2 m-2 rounded-md w-52 hover:bg-gray-600 group" >
                        <FriendIcon size={'28'} color={'gray-400 ml-2 group-hover:text-gray-200'} />
                        <span className="ml-3 text-gray-400 group-hover:text-gray-200">Přátelé</span>
                    </Link>

                    <div className="flex items-center justify-between w-48">
                        <span className="text-xs font-semibold text-gray-400 uppercase hover:text-gray-200">Přímé zprávy</span>
                        <AddIcon size="18" color="gray-400 hover:text-gray-200 cursor-pointer" />
                    </div>

                    {
                        channels.filter(ch => ch.type === 'dm').map((ch, i) => {
                            const friendId = ch.users?.find(u => u !== user._id);
                            const friend = users.find(u => u._id === friendId);

                            return (
                                <Link key={i} onClick={() => setChannel(ch._id)} to={ch._id} className="flex items-center justify-between p-2 m-2 rounded-md w-52 hover:bg-gray-600 group">
                                    <div className="relative flex items-center">
                                        <Img src={friend?.avatar} className="rounded-full h-9 w-9" />
                                        {friend?.status === 'online' && <span className="-bottom-[2px] left-[26px] absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 group-hover:dark:border-gray-600 rounded-full"></span>}
                                        <span className="ml-3 text-sm font-medium text-gray-400 group-hover:text-gray-200">{friend?.username}</span>
                                    </div>

                                    <CloseIcon size={'16'} color={'gray-200 mr-2 hidden group-hover:block'} />
                                </Link>
                            )
                        })
                    }
                </div>
            </div>

            <div className="flex flex-col">
                <Outlet />

                {channel !== 'none' && <ChatInput />}
            </div>
        </div>
    )
}

export default FriendSidebar;