import { FC } from "react"
import { useChannel } from "../store/channel"
import { useUser } from "../store/user";

const ChannelBar: FC = () => {
    const { channel, channels } = useChannel(state => state);
    const user = useUser(state => state.user);
    const users = useUser(state => state.users);

    const dm = channels.find(ch => ch._id === channel);

    const friendId = dm?.users?.find(u => u !== user._id);
    const friend = users.find(u => u._id === friendId);

    return (
        <div>   
            {
                dm?.type !== 'dm' &&
                    <div className="font-bold text-white h-12 w-full ml-56 fixed flex items-center bg-gray-700 border-b-[1px] border-gray-900">
                        <span className="ml-2 text-2xl font-bold text-gray-300 uppercase">#</span>
                        <span className="ml-1">{dm?.name}</span>
                    </div>
            }

            {
                dm?.type === 'dm' &&
                    <div className="font-bold text-white h-12 w-full ml-56 fixed flex items-center bg-gray-700 border-b-[1px] border-gray-900">
                        <span className="ml-2 text-xl font-bold text-gray-400 uppercase">@</span>
                        <span className="ml-1">{friend?.username}</span>
                    </div>
            }
        </div> 
    )
}

export default ChannelBar;