import { NextPage } from "next";
import { ReactElement } from "react";
import FriendContent from "../../../components/home/FriendContent";
import FriendSidebar from "../../../components/layouts/home/FriendSidebar";
import { NextPageWithLayout } from "../../../utils/types";

const HomePage: NextPageWithLayout<any> = () => {
    return (
        <div className="bg-gray-700 h-full w-[calc(100vw_-_300px)] mt-12">
            <FriendContent />
        </div>
    )
}

HomePage.getLayout = (page: ReactElement) => {
    return <FriendSidebar>{page}</FriendSidebar>
}

HomePage.app = true;

export default HomePage;