import { Dispatch, FC, ReactElement, SetStateAction, useState } from "react";
import { CloseIcon } from "../../components/ui/Icons";
import { useSettings } from "@kratercord/common/store/settings";
import AppSettings, { Notifications, System, VoiceAndVideo } from "./AppSettings";
import UserSettings, { Account, Requests, Profiles } from "./UserSettings";

const Settings: FC = () => {
    const [setting, setSetting] = useState('profil');

    const closeSettings = useSettings(state => state.closeSettings);
    const unsaved = useSettings(state => state.unsaved);

    return (
        <div className="flex fixed z-10 bottom-0 left-0 w-full h-[calc(100%_-_20px)] bg-gray-700 animate-openSettings">
            <div className='absolute w-1/3 h-full overflow-scroll overflow-x-hidden bg-gray-800 thin-scrollbar'>
                <div className="float-right w-56 mt-12">
                    <UserSettings set={setSetting} />
                    <AppSettings set={setSetting} />
                </div>
            </div>

            <div className="ml-[33.333333%] h-full w-1/2 mt-12">
                <SettingsContent set={setSetting} setting={setting} />
            </div>

            <div onClick={() => !unsaved && closeSettings()} className="relative flex items-center justify-center w-8 h-8 mt-12 border-2 border-gray-400 rounded-full cursor-pointer group hover:border-gray-100">
                <CloseIcon size="20" color="text-gray-400 group-hover:text-gray-100 absolute" />
            </div>
        </div>
    )
}

export default Settings;

const SettingsContent: FC<{ setting: string; set: Dispatch<SetStateAction<string>>; }> = ({ setting, set }) => {
    type Options = {
        [key: string]: ReactElement;
    }

    const options: Options = {
        "ucet": <Account set={set} />,
        "profil": <Profiles />,
        "zadosti": <Requests />,
        "hlas": <VoiceAndVideo />,
        "oznameni": <Notifications />,
        "windows": <System />
    }

    return options[setting];
}