import { FC } from "react";
import { useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { useSettings } from "../../../store/settings";
import { Channel, useUser } from "../../../store/user";
import { ChannelIcon } from "../../ui/Icons";

const ChannelBar: FC = () => {
    const { guildId, channelId } = useParams();

    const dms = useUser(state => state.user.dms);
    const userId = useUser(state => state.user.id);

    const dm = dms.find(dm => dm.id === channelId);

    const friend = dm?.users[0].id === userId ? dm.users[1] : dm?.users[0]

    const queryClient = useQueryClient();

    const channels = queryClient.getQueryData<Channel[]>(["channels", guildId]);
    const channel = channels?.find(ch => ch.id === channelId);

    return (
        <div>   
            {
                !dm ?
                    <div className="font-bold text-white h-12 w-full ml-56 fixed flex items-center bg-gray-700 border-b-[1px] border-gray-900">
                        <ChannelIcon size="20" color="text-gray-300 ml-2" />
                        <span className="ml-1">{channel?.name}</span>
                    </div>
                :
                    <div className="font-bold text-white h-12 w-full ml-56 fixed flex items-center bg-gray-700 border-b-[1px] border-gray-900">
                        <span className="ml-2 text-xl font-bold text-gray-400 uppercase">@</span>
                        <span className="ml-1">{friend?.username}</span>
                    </div>
            }
        </div> 
    )
}

export default ChannelBar;