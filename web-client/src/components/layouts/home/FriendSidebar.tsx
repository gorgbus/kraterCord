import { ReactElement } from "react";
import { useUserStore } from "@kratercord/common/store/user";
import ChannelBar from "../channel/ChannelBar";
import ChatInput from "../ChatInput";
import FriendBar from "./FriendBar";
import { AddIcon, CloseIcon, FriendIcon } from "../../ui/Icons";
import UserProfile from "../UserProfile";
import { useRouter } from "next/router";
import Image from 'next/future/image';

const FriendSidebar = ({ children }: { children: ReactElement }) => {
    const router = useRouter();
    const { channelId } = router.query;

    const dms = useUserStore(state => state.user.dms);
    const userId = useUserStore(state => state.user.id);

    return (
        <div className="flex w-full h-full">
            <div className="flex flex-col w-56 h-full bg-gray-800 rounded-tl-md">
                {!channelId && <FriendBar />}
                {channelId && <ChannelBar />}

                <div className="bg-gray-800 font-bold rounded-tl-md text-white uppercase border-b-[1px] border-gray-900 flex items-center w-56 h-12">
                    <input disabled={true} className="w-full h-6 p-1 m-2 text-xs rounded-sm cursor-pointer bg-slate-900 placeholder:text-gray-300 focus:outline-none" type="text" placeholder="Najít nebo začít konverzaci" />
                </div>

                <div className=" w-ful h-[calc(100%_-_96px)] overflow-scroll overflow-x-hidden flex flex-col items-center thin-scrollbar">
                    <div onClick={() => router.push("/channels/@me")} className="flex items-center p-2 m-2 mr-1 rounded-md cursor-pointer w-52 hover:bg-gray-600 group" >
                        <FriendIcon size='28' color='gray-400 ml-2 group-hover:text-gray-200' />
                        <span className="ml-3 text-gray-400 group-hover:text-gray-200">Přátelé</span>
                    </div>

                    <div className="flex items-center justify-between w-48">
                        <span className="text-xs font-semibold text-gray-400 uppercase hover:text-gray-200">Přímé zprávy</span>
                        <AddIcon size="18" color="text-gray-400 hover:text-gray-200 cursor-pointer" />
                    </div>

                    {
                        dms.map((channel, i) => {
                            const friend = channel.users[0].id === userId ? channel.users[1] : channel.users[0];

                            return (
                                <div key={i} onClick={() => router.push(`/channels/@me/${channel.id}`)} className="flex items-center justify-between p-2 m-2 mr-1 rounded-md cursor-pointer w-52 hover:bg-gray-600 group">
                                    <div className="flex items-center">
                                        <div className="relative flex items-center">
                                            <Image src={friend.avatar} alt={friend.username} width={32} height={32} className="rounded-full" />
                                            {friend.status === 'ONLINE' && <span className="-bottom-[2px] -right-[2px] absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 group-hover:dark:border-gray-600 rounded-full"></span>}
                                        </div>

                                        <span className="ml-3 text-sm font-medium text-gray-400 group-hover:text-gray-200">{friend.username}</span>
                                    </div>

                                    <CloseIcon size='16' color='text-gray-200 mr-2 hidden group-hover:block' />
                                </div>
                            )
                        })
                    }
                </div>

                <UserProfile />
            </div>

            <div className="flex flex-col">
                {children}

                {channelId && <ChatInput />}
            </div>
        </div>
    )
}

export default FriendSidebar;