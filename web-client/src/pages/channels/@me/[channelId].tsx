import { useRouter } from "next/router";
import { ReactElement } from "react";
import FriendSidebar from "@kratercord/common/components/layouts/home/FriendSidebar";
import { NextPageWithLayout } from "../../../utils/types";
import ChannelComponent from '@kratercord/common/components/Channel';
import Image from "next/future/image";

const Channel: NextPageWithLayout<any> = () => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <ChannelComponent params={router.query} Image={Image} navigate={navigate} dm={true} />
}

Channel.getLayout = (page: ReactElement) => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <FriendSidebar params={router.query} Image={Image} navigate={navigate} children={page} />
}

Channel.app = true;

export default Channel;