import { ReactElement } from "react";
import FriendSidebar from "../../../components/layouts/home/FriendSidebar";
import { NextPageWithLayout } from "../../../utils/types";
import ChannelComponent from '../[guildId]/[channelId]';

const Channel: NextPageWithLayout<any> = () => {
    return <ChannelComponent dm={true} />
}

Channel.getLayout = (page: ReactElement) => {
    return <FriendSidebar>{page}</FriendSidebar>
}

Channel.app = true;

export default Channel;