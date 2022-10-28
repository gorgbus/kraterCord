import { ReactElement } from "react";
import FriendContent from "@kratercord/common/components/home/FriendContent";
import FriendSidebar from "@kratercord/common/components/layouts/home/FriendSidebar";
import { NextPageWithLayout } from "../../../utils/types";
import Image from "next/future/image";
import { useRouter } from "next/router";

const HomePage: NextPageWithLayout<any> = () => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return (
        <div className="bg-gray-700 h-full w-[calc(100vw_-_300px)] mt-12">
            <FriendContent navigate={navigate} Image={Image} />
        </div>
    )
}

HomePage.getLayout = (page: ReactElement) => {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    return <FriendSidebar params={router.query} Image={Image} navigate={navigate} children={page} />
}

HomePage.app = true;

export default HomePage;