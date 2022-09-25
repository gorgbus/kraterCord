import { FC } from "react";
import Img from "react-cool-img";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { fetchMembers } from "../../../utils/api";

const MemberSidebar: FC = () => {
    const { guildId } = useParams();

    const { data, isLoading, isError, isSuccess } = useQuery(['members', guildId], () => fetchMembers(guildId as string));

    return (
        <div className="bg-gray-800 h-[calc(100%_-_48px)] mt-12 w-56 pl-2 flex flex-col items-center">
            {
                isError &&
                    <span>error</span>
            }

            {
                isLoading &&
                    <span>loading...</span>
            }

            {
                isSuccess && data &&
                    <div className="flex flex-col items-start mt-2 overflow-scroll overflow-x-hidden thin-scrollbar h-[calc(100%_-_8px)]">
                        <span className={`uppercase font-bold text-[0.6rem] text-gray-400 mt-1 mb-1 ${data.filter(member => member.user.status === "ONLINE").length < 1 && `hidden`}`}>online — {data.filter(member => member.user.status === "ONLINE").length}</span>
                        <div className="flex flex-col items-center">
                            {
                                data.filter(member => member.user.status === "ONLINE").map((member, i) => {
                                    return (
                                        <div key={i} className="grid p-1 rounded user w-52 hover:bg-gray-600 group">
                                            <div className="relative">
                                                <Img className="w-8 h-8 rounded-full" src={member.user.avatar} alt={`${member.user.username}:avatar`}></Img>
                                                <span className="-bottom-[2px] right-0 absolute w-3.5 h-3.5 bg-green-400 border-2 border-gray-800 group-hover:border-gray-600 rounded-full"></span>
                                            </div>
                                            
                                            <span className="pt-1 overflow-hidden text-sm font-bold text-gray-300 w-36 whitespace-nowrap text-ellipsis">{member.user.username}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        
                        <span className={`uppercase font-bold text-[0.6rem] text-gray-400 mt-1 mb-1 ${data.filter(member => member.user.status === "OFFLINE").length < 1 && `hidden`}`}>offline — {data.filter(member => member.user.status === "OFFLINE").length}</span>
                        <div className="flex flex-col items-center">
                            {
                                data.filter(member => member.user.status === "OFFLINE").map((member, i) => {
                                    return (
                                        <div key={i} className="grid p-1 rounded user w-52 opacity-30 hover:opacity-100 hover:bg-gray-600">
                                            <Img className="w-8 h-8 rounded-full" src={member.user.avatar} alt={`${member.user.username}:avatar`}></Img>
                                            <span className="pt-1 overflow-hidden text-sm font-bold text-gray-300 w-36 whitespace-nowrap text-ellipsis">{member.user.username}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
            }
        </div>
    )
}

export default MemberSidebar;