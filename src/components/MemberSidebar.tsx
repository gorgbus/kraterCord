import { FC } from "react";
import { useUser } from "../store/user";
import Img from "react-cool-img";
import "./../styles/users.css";

const MemberSidebar: FC = () => {
    const users = useUser(state => state.users);

    return (
        <div className="bg-gray-800 h-[calc(100%_-_48px)] mt-12 w-56 pl-2 flex flex-col items-center">
            <div className="flex flex-col items-start mt-2 overflow-scroll overflow-x-hidden users h-[calc(100%_-_8px)]">
                <span className={`uppercase font-bold text-[0.6rem] text-gray-400 mt-1 mb-1 ${users.filter(u => u.status === "online").length < 1 && `hidden`}`}>online — {users.filter(u => u.status === "online").length}</span>
                <div className="flex flex-col items-center">
                    {
                        users.filter(u => u.status === "online").map((user, i) => {
                            return (
                                <div key={i} className="grid user w-52 p-1 rounded hover:bg-gray-600 group">
                                    <div className="relative">
                                        <Img className="rounded-full h-9 w-9" src={user.avatar} alt={`${user.username}:avatar`}></Img>
                                        <span className="bottom-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 group-hover:dark:border-gray-600 rounded-full"></span>
                                    </div>
                                    
                                    <span className="text-gray-300 font-bold text-sm pt-1">{user.username}</span>
                                </div>
                            )
                        })
                    }
                </div>
                
                <span className={`uppercase font-bold text-[0.6rem] text-gray-400 mt-1 mb-1 ${users.filter(u => u.status !== "online").length < 1 && `hidden`}`}>offline — {users.filter(u => u.status !== "online").length}</span>
                <div className="flex flex-col items-center">
                    {
                        users.filter(u => u.status !== "online").map((user, i) => {
                            return (
                                <div key={i} className="grid user w-52 p-1 rounded opacity-30 hover:opacity-100 hover:bg-gray-600">
                                    <Img className="rounded-full h-9 w-9" src={user.avatar} alt={`${user.username}:avatar`}></Img>
                                    <span className="text-gray-300 font-bold text-sm pt-1">{user.username}</span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default MemberSidebar;