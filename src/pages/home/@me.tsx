import { FC } from "react";
import FriendContent from "./FriendContent";

const HomePage: FC = () => {
    return (
        <div className="bg-gray-700 h-[calc(100vh_-_68px)] w-[calc(100vw_-_300px)] mt-12">
            <FriendContent />
        </div>
    )
}

export default HomePage