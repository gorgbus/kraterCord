import { Dispatch, FC, ReactElement, SetStateAction, useState } from "react";
import { CloseIcon } from "../Icons";
import { useSettings } from "@kratercord/common/store/settings";
import AppSettings, { Notifications, VoiceAndVideo, System } from "./AppSettings";
import UserSettings, { Account, Requests, Profiles } from "./UserSettings";
import { BaseProps, Optional } from "../../types";

const Settings: FC<BaseProps> = ({ navigate, Image, params }) => {
    const [setting, setSetting] = useState('ucet');

    const closeSettings = useSettings(state => state.closeSettings);
    const unsaved = useSettings(state => state.unsaved);

    return (
        <div className="fixed bottom-0 left-0 z-10 flex w-full h-full bg-gray-700 animate-openSettings">
            <div className='absolute w-1/3 h-full overflow-scroll overflow-x-hidden bg-gray-800 thin-scrollbar'>
                <div className="float-right w-56 mt-12">
                    <UserSettings set={setSetting} />
                    <AppSettings navigate={navigate} set={setSetting} />
                </div>
            </div>

            <div className="ml-[33.333333%] h-full w-[42rem] mt-12">
                <SettingsContent params={params} Image={Image} set={setSetting} setting={setting} />
            </div>

            <div onClick={() => !unsaved && closeSettings()} className="relative flex items-center justify-center w-8 h-8 mt-12 border-2 border-gray-400 rounded-full cursor-pointer group hover:border-gray-100">
                <CloseIcon size="20" color="text-gray-400 group-hover:text-gray-100 absolute" />
            </div>
        </div>
    )
}

export default Settings;

interface SettingsProps extends Optional<BaseProps, "navigate"> {
    setting: string;
    set: Dispatch<SetStateAction<string>>;
}

const SettingsContent: FC<SettingsProps> = ({ setting, set, Image, params }) => {
    type Options = {
        [key: string]: ReactElement;
    }

    const options: Options = {
        "ucet": <Account Image={Image} set={set} />,
        "profil": <Profiles Image={Image} params={params} />,
        "zadosti": <Requests />,
        "hlas": <VoiceAndVideo />,
        "oznameni": <Notifications />,
        "system": <System />
    }

    return options[setting];
}