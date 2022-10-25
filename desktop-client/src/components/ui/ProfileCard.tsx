import { FC, MutableRefObject, useEffect, useRef } from "react";
import { Member } from "@kratercord/common/types";
import Img from "react-cool-img";

const ProfileCard: FC<{ preview?: boolean; customClass?: string;  close: () => void; member?: Member; user?: { username: string; hash: string; about: string; avatar?: string; banner?: string; nickname?: string; }; }> = ({ close, member, user, customClass, preview }) => {
    const profileRef = useRef() as MutableRefObject<HTMLDivElement>;

    const closeProfile = (e: any) => {
        if (profileRef.current && !profileRef.current.contains(e.target) && e.target.id !== "title-bar") {
            close();
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', closeProfile);

        return () => {
            document.removeEventListener('mousedown', closeProfile);
        }
    }, []);

    return (
        <div ref={profileRef} className={`z-50 w-64 rounded-md drop-shadow-xl bg-gray-900 cursor-default ${customClass || "right-[14.5rem] fixed"}`}>
            <div className="flex flex-col w-full h-24 bg-orange-300 rounded-t-md">
                <div className="w-full overflow-hidden h-2/3">
                    {(user?.banner || member?.background || member?.user.background) && <Img className="rounded-t-md" width={600} height={240} src={user?.banner || member?.background || member?.user.background!} alt={`${user?.username}:profile-banner`} />}
                </div>

                <div className="w-full bg-gray-900 h-1/3">
                    <div className="relative ml-4 -mt-10 group">
                        <Img width={80} height={80} className="w-20 h-20 border-4 border-gray-900 rounded-full" alt="avatar-settings" src={user?.avatar || member?.avatar || member?.user.avatar!} />
                    </div>
                </div>
            </div>

            <div className="w-64 h-full p-4">
                <div className={`${member?.nickname && "-mb-2"} text-lg font-semibold`}>
                    {
                        (!(preview && !user?.nickname) && (member?.nickname || user?.nickname)) ?
                            <span className="text-gray-100">{user?.nickname || member?.nickname}</span>
                        :
                            <>
                                <span className="text-gray-100">{member?.user.username || user?.username}</span>
                                <span className="text-gray-400">#{member?.user.hash || user?.hash}</span>
                            </>
                    }
                </div>

                {(!(preview && !user?.nickname) && (member?.nickname || user?.nickname)) && <span className="text-sm font-semibold text-gray-400">{member?.user.username}#{member?.user.hash}</span>}

                <div className="w-full h-[1px] mt-2 mb-2 bg-gray-600"></div>

                {(member?.user.about || user?.about) && <h3 className="text-xs font-bold text-gray-300 uppercase">o mně</h3>}
                <p className="text-sm font-semibold text-gray-300 w-full break-words max-w-[40ch]">{member?.user.about || user?.about}</p>
            </div>
        </div>
    )
}

export default ProfileCard;