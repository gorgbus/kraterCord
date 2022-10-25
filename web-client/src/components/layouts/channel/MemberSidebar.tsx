import Image from "next/future/image";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { useQuery } from "react-query";
import { fetchMembers } from "@kratercord/common/api";
import ProfileCard from "../../ui/ProfileCard";

const MemberSidebar: FC = () => {
    const { guildId } = useRouter().query;

    const { data, isLoading, isError, isSuccess } = useQuery(['members', guildId], () => fetchMembers(guildId as string));

    const [selected, select] = useState("");

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
                                        <div onClick={() => select(member.userId)} key={i} className="relative grid p-1 rounded cursor-pointer user w-52 hover:bg-gray-600 group">
                                            <div className="relative">
                                                <Image width={32} height={32} className="w-8 h-8 rounded-full" src={member.avatar || member.user.avatar} alt={`${member.user.username}:avatar`} />
                                                <span className="-bottom-[2px] right-0 absolute w-3.5 h-3.5 bg-green-400 border-2 border-gray-800 group-hover:border-gray-600 rounded-full"></span>
                                            </div>
                                            
                                            <span className="pt-1 overflow-hidden text-sm font-bold text-gray-300 w-36 whitespace-nowrap text-ellipsis">{member.nickname || member.user.username}</span>

                                            {selected === member.user.id && <ProfileCard member={member} close={() => select("")} />}
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
                                        <div onClick={() => select(member.userId)} key={i} className="relative grid p-1 rounded cursor-pointer user w-52 group hover:bg-gray-600">
                                            <Image width={32} height={32} className="w-8 h-8 rounded-full group-hover:opacity-100 opacity-30" src={member.avatar || member.user.avatar} alt={`${member.user.username}:avatar`} />
                                            <span className="pt-1 overflow-hidden text-sm font-bold text-gray-300 w-36 whitespace-nowrap text-ellipsis group-hover:opacity-100 opacity-30">{member.nickname || member.user.username}</span>
                                        
                                            {selected === member.userId && <ProfileCard member={member} close={() => select("")} />}
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