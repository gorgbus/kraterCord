import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FriendContent from "./FriendContent";
import { isAuthenticated } from "./utils/api";

const MainPage: FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const auth = await isAuthenticated()

            if (!auth) {
                navigate("/");
            }
        }

        checkAuth();
    }, []);

    return (
        <div className="bg-gray-700 h-[calc(100vh_-_68px)] w-[calc(100vw_-_300px)] mt-12">
            <FriendContent />
        </div>
    )
}

export default MainPage