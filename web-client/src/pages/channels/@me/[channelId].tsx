import { useRouter } from "next/router";
import { FC, ReactElement } from "react";
import FriendSidebar from "@kratercord/common/components/layouts/home/FriendSidebar";
import { NextPageWithLayout } from "../../../utils/types";
import ChannelComponent from '@kratercord/common/components/Channel';
import Image from "next/future/image";

const Channel: NextPageWithLayout<any> = () => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <ChannelComponent params={router.query} Image={Image} navigate={navigate} dm={true} />
}

const LayoutWrapper: FC<{ page: ReactElement }> = ({ page }) => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <FriendSidebar params={router.query} Image={Image} navigate={navigate}>{page}</FriendSidebar>
}

Channel.getLayout = (page: ReactElement) => {
    return <LayoutWrapper page={page} />
}

Channel.app = true;

export default Channel;