import { FC } from "react";
import Img from "react-cool-img";
import Settings from "../../pages/settings/Setings";
import { useChannel } from "../../store/channel";
import { useGuild } from "../../store/guild";
import { useSettings } from "../../store/settings";
import { useSocket } from "../../store/socket";
import { useUser } from "../../store/user";
import { ConnectionIcon, DeafenHeadphoneIcon, HeadphoneIcon, LeaveCallIcon, MicIcon, MutedMicIcon, SettingsIcon } from "../ui/Icons";

const UserProfile: FC = () => {
    const openSettings = useSettings(state => state.openSettings);
    const open = useSettings(state => state.open);
    const user = useUser(state => state.user);
    const guilds = useGuild(state => state.guilds);
    const guild = useChannel(state => state.voiceGuild);
    const channels = useChannel(state => state.channels);
    const voice = useChannel(state => state.voice);
    const socket = useSocket(state => state.socket);

    const setVoice = useChannel(state => state.setVoice);
    const setVoiceGuild = useChannel(state => state.setVoiceGuild);
    const removeUser = useChannel(state => state.removeUser);

    const muted = useSettings(state => state.muted);
    const deafen = useSettings(state => state.deafen);
    const toggleMute = useSettings(state => state.toggleMute);
    const toggleDeafen = useSettings(state => state.toggleDeafen);
    const setProducer = useSettings(state => state.setProducer);

    const voiceChannel = channels.find(c => c._id === voice);
    const voiceGuild = guilds.find(g => g._id === guild);

    const disconnect = () => {
        socket?.emit('leave_channel', voice, user._id);

        setProducer('none');
        removeUser(voice, user._id);
        setVoice('none');
        setVoiceGuild('none');
    }

    return (
        <div className={`flex flex-col w-full bg-gray-850 ${voice === 'none' ? 'h-12' : 'h-24'}`}>
            {
                voice !== 'none' &&
                    <div className="h-12 border-b-[1px] border-b-gray-600 flex items-center w-full justify-between">
                        <div className="flex flex-col m-2">
                            <div className="flex items-start">
                                <ConnectionIcon size="16" color="text-green-500 mr-1" />
                                <span className="text-sm font-semibold text-green-500">Hlas připojen</span>
                            </div>

                            <span className="text-xs text-gray-400">{voiceChannel?.name}/{voiceGuild?.name}</span>
                        </div>

                        <div onClick={disconnect} className="m-2 icons group">
                            <LeaveCallIcon size='20' color='text-gray-400 group-hover:text-gray-100' />
                        </div>
                    </div>
            }

            <div className="flex items-center justify-between w-full h-12">
                <div className="relative w-8 h-8 ml-2">
                    <Img src={user.avatar} className='w-8 h-8 rounded-full' />
                    <span className="-bottom-[2px] -right-[2px] absolute w-3.5 h-3.5 bg-green-400 border-gray-850 border-2 rounded-full"></span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[0.8rem] font-semibold text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis w-20">{user.username}</span>
                    <span className="text-[0.65rem] text-gray-400">#{user.hash}</span>
                </div>

                <div className="flex items-center justify-center mr-2">
                    <div onClick={toggleMute} className="icons group">
                        {muted ? <MutedMicIcon size='18' color='text-gray-400 group-hover:text-gray-100' strikeColor='text-red-500' /> : <MicIcon size='18' color='text-gray-400 group-hover:text-gray-100' />}
                    </div>

                    <div onClick={toggleDeafen} className="icons group">
                        {deafen ? <DeafenHeadphoneIcon size='18' color='text-gray-400 group-hover:text-gray-100' strikeColor='text-red-500' /> : <HeadphoneIcon size='18' color='text-gray-400 group-hover:text-gray-100' />} 
                    </div>

                    <div onClick={openSettings} className="icons group">
                        <SettingsIcon size='18' color='text-gray-400 group-hover:text-gray-100' />
                    </div>
                </div>

                {open && <Settings />}
            </div>
        </div>
    )
}

export default UserProfile;