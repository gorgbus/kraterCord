import { FC } from "react";
import Img from "react-cool-img";
import { Link, Outlet, useParams } from "react-router-dom";
import { useUser } from "../../../store/user";
import ChannelBar from "../channel/ChannelBar";
import ChatInput from "../ChatInput";
import FriendBar from "./FriendBar";
import { AddIcon, CloseIcon, FriendIcon } from "../../ui/Icons";
import UserProfile from "../UserProfile";

const FriendSidebar: FC = () => {
    const { channelId } = useParams();

    const dms = useUser(state => state.user.dms);
    const userId = useUser(state => state.user.id);

    return (
        <div className="flex w-full h-full">
            <div className="flex flex-col w-56 h-full bg-gray-800 rounded-tl-md">
                {!channelId && <FriendBar />}
                {channelId && <ChannelBar />}

                <div className="bg-gray-800 font-bold rounded-tl-md text-white uppercase border-b-[1px] border-gray-900 flex items-center w-56 h-12">
                    <input disabled={true} className="w-full h-6 p-1 m-2 text-xs rounded-sm cursor-pointer bg-slate-900 placeholder:text-gray-300 focus:outline-none" type="text" placeholder="Najít nebo začít konverzaci" />
                </div>

                <div className=" w-ful h-[calc(100%_-_96px)] overflow-scroll overflow-x-hidden flex flex-col items-center thin-scrollbar">
                    <Link to={'/channels/@me'} className="flex items-center p-2 m-2 mr-1 rounded-md w-52 hover:bg-gray-600 group" >
                        <FriendIcon size='28' color='gray-400 ml-2 group-hover:text-gray-200' />
                        <span className="ml-3 text-gray-400 group-hover:text-gray-200">Přátelé</span>
                    </Link>

                    <div className="flex items-center justify-between w-48">
                        <span className="text-xs font-semibold text-gray-400 uppercase hover:text-gray-200">Přímé zprávy</span>
                        <AddIcon size="18" color="text-gray-400 hover:text-gray-200 cursor-pointer" />
                    </div>

                    {
                        dms.map((channel, i) => {
                            const friend = channel.users[0].id === userId ? channel.users[1] : channel.users[0];

                            return (
                                <Link key={i} to={channel.id} className="flex items-center justify-between p-2 m-2 mr-1 rounded-md w-52 hover:bg-gray-600 group">
                                    <div className="flex items-center">
                                        <div className="relative flex items-center">
                                            <Img src={friend.avatar} className="w-8 h-8 rounded-full" />
                                            {friend.status === 'ONLINE' && <span className="-bottom-[2px] -right-[2px] absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 group-hover:dark:border-gray-600 rounded-full"></span>}
                                        </div>

                                        <span className="ml-3 text-sm font-medium text-gray-400 group-hover:text-gray-200">{friend.username}</span>
                                    </div>

                                    <CloseIcon size='16' color='text-gray-200 mr-2 hidden group-hover:block' />
                                </Link>
                            )
                        })
                    }
                </div>

                <UserProfile />
            </div>

            <div className="flex flex-col">
                <Outlet />

                {channelId && <ChatInput />}
            </div>
        </div>
    )
}

export default FriendSidebar;