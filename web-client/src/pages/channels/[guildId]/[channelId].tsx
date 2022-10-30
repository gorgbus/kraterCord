import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../../utils/types";
import ChannelSidebar from "@kratercord/common/components/layouts/channel/ChannelSidebar";
import Image from "next/future/image";
import ChannelComponent from "@kratercord/common/components/Channel";
import { FC, ReactElement } from "react";

const Channel: NextPageWithLayout<any> = () => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <ChannelComponent params={router.query} navigate={navigate} Image={Image} />
}

const LayoutWrapper: FC<{ page: ReactElement }> = ({ page }) => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <ChannelSidebar Image={Image} navigate={navigate} params={router.query}>{page}</ChannelSidebar>
}

Channel.getLayout = (page: ReactElement) => {
    return <LayoutWrapper page={page} />
}

Channel.app = true;

export default Channel;