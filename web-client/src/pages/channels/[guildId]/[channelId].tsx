import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../../utils/types";
import ChannelSidebar from "@kratercord/common/components/layouts/channel/ChannelSidebar";
import Image from "next/future/image";
import ChannelComponent from "@kratercord/common/components/Channel";
import { ReactElement } from "react";

const Channel: NextPageWithLayout<any> = () => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <ChannelComponent params={router.query} navigate={navigate} Image={Image} />
}

Channel.getLayout = (page: ReactElement) => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <ChannelSidebar children={page} Image={Image} navigate={navigate} params={router.query} />
}

Channel.app = true;

export default Channel;