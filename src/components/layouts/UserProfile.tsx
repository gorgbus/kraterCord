import { FC, useState } from "react";
import Img from "react-cool-img";
import Settings from "../../pages/settings/Setings";
import { useSettings } from "../../store/settings";
import { useUser } from "../../store/user";
import { HeadphoneIcon, MicIcon, MutedMicIcon, SettingsIcon } from "../ui/Icons";

const UserProfile: FC = () => {
    const openSettings = useSettings(state => state.openSettings);
    const open = useSettings(state => state.open);
    const user = useUser(state => state.user);

    return (
        <div className="flex items-center w-full h-12 justify-evenly bg-gray-850">
            <div className="relative w-8 h-8">
                <Img src={user.avatar} className='w-8 h-8 rounded-full' />
                <span className="-bottom-[2px] -right-[2px] absolute w-3.5 h-3.5 bg-green-400 border-gray-850 border-2 rounded-full"></span>
            </div>

            <div className="flex flex-col">
                <span className="text-[0.8rem] font-semibold text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis w-20">{user.username}</span>
                <span className="text-[0.65rem] text-gray-400">#{user.hash}</span>
            </div>

            <div className="flex items-center justify-center">
                <div className="icons group">
                    <MicIcon size='18' color='gray-400 group-hover:text-gray-100' />
                </div>

                <div className="icons group">
                    <HeadphoneIcon size='18' color='gray-400 group-hover:text-gray-100' />
                </div>

                <div onClick={openSettings} className="icons group">
                    <SettingsIcon size='18' color='gray-400 group-hover:text-gray-100' />
                </div>
            </div>

            {open && <Settings />}
        </div>
    )
}

export default UserProfile;