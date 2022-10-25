import { FC, useEffect, useState } from "react";
import Img from "react-cool-img";
import { useQueryClient } from "react-query";
import Settings from "../../pages/settings/Settings";
import { useSettings } from "@kratercord/common/store/settings";
import { useUserStore } from "@kratercord/common/store/user";
import { Channel } from "@kratercord/common/types";
import { useChannel, useVoiceChannel } from "@kratercord/common/hooks";
import { ConnectionIcon, DeafenHeadphoneIcon, HeadphoneIcon, LeaveCallIcon, MicIcon, MutedMicIcon, SettingsIcon } from "../ui/Icons";

const UserProfile: FC = () => {
    const openSettings = useSettings(state => state.openSettings);
    const open = useSettings(state => state.open);
    const avatar = useUserStore(state => state.user.avatar);
    const username = useUserStore(state => state.user.username);
    const hash = useUserStore(state => state.user.hash);
    const guilds = useUserStore(state => state.user.guilds);
    const members = useUserStore(state => state.user.members);
    const guild = useSettings(state => state.voiceGuild);
    const voice = useSettings(state => state.voiceChannel);
    // const socket = useSocket(state => state.socket);
    const track = useSettings(state => state.track);
    const setTrack = useSettings(state => state.setTrack);

    const setVoice = useSettings(state => state.setVoiceChannel);
    const setVoiceGuild = useSettings(state => state.setVoiceGuild);
    const setTalkingUsers = useSettings(state => state.setTalkingUsers);

    const muted = useSettings(state => state.muted);
    const deafen = useSettings(state => state.deafen);
    const voiceStatus = useSettings(state => state.voiceStatus);
    const toggleMute = useSettings(state => state.toggleMute);
    const toggleDeafen = useSettings(state => state.toggleDeafen);
    const setProducer = useSettings(state => state.setProducer);

    const [leaving, setLeave] = useState(false);

    const queryClient = useQueryClient();

    const channels = queryClient.getQueryData<Channel[]>(["channels", guild]);
    const { leaveChannelUser } = useChannel();
    const { disconnectSocket } = useVoiceChannel();

    const voiceChannel = channels?.find(c => c.id === voice);
    const voiceGuild = guilds.find(g => g.id === guild);

    const member = members.find(m => m.guildId === voiceGuild?.id);

    const disconnect = () => {
        if (leaving) return;

        setLeave(true);
        track?.stop();
        setTrack(undefined!);

        disconnectSocket();
    }

    const mute = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
        });

        if (stream) {
            toggleMute();
            stream.getAudioTracks()[0].stop();
        };
    }

    const voiceStatusColor = (status: string) => {
        if (leaving) return 'text-red-500';

        type Options = {
            [key: string]: string;
        }

        const statusColors: Options = {
            "connected": "text-green-500",
            "connecting": "text-orange-500",
            "failed": "text-red-500",
            "closed": "text-red-500",
            "disconnected": "text-red-500",
        }

        return statusColors[status];
    }

    const voiceStatusText = (status: string) => {
        if (leaving) return 'Odpojeno';

        type Options = {
            [key: string]: string;
        }

        const statusTexts: Options = {
            "connected": "Hlas připojen",
            "connecting": "Připojování",
            "failed": "Odpojeno",
            "closed": "Odpojeno",
            "disconnected": "Odpojeno",
        }

        return statusTexts[status];
    }

    useEffect(() => {
        if (!leaving && voiceStatus !== 'disconnected') return;
        
        setProducer('none');
        setVoice('none');
        setVoiceGuild('none');
        setTalkingUsers([]);

        leaveChannelUser({
            guildId: voiceGuild?.id!,
            channelId: voice,
            memberId: member?.id!
        });

        setLeave(false);
    }, [voiceStatus]);

    return (
        <div className={`flex flex-col w-full bg-gray-850 ${voice === 'none' ? 'h-12' : 'h-24'}`}>
            {
                voice !== 'none' &&
                    <div className="h-12 border-b-[1px] border-b-gray-600 flex items-center w-full justify-between">
                        <div className="flex flex-col m-2">
                            <div className="flex items-start">
                                <ConnectionIcon size="16" color={`${voiceStatusColor(voiceStatus)} mr-1`} />
                                <span className={`text-sm font-semibold ${voiceStatusColor(voiceStatus)}`}>{voiceStatusText(voiceStatus)}</span>
                            </div>

                            <span className="w-40 overflow-hidden text-xs text-gray-400 whitespace-nowrap text-ellipsis">{voiceChannel?.name}/{voiceGuild?.name}</span>
                        </div>

                        <div onClick={disconnect} className="m-2 icons group">
                            <LeaveCallIcon size='20' color='text-gray-400 group-hover:text-gray-100' />
                        </div>
                    </div>
            }

            <div className="flex items-center justify-between w-full h-12">
                <div className="relative w-8 h-8 ml-2">
                    <Img src={avatar} className='w-8 h-8 rounded-full' />
                    <span className="-bottom-[2px] -right-[2px] absolute w-3.5 h-3.5 bg-green-400 border-gray-850 border-2 rounded-full"></span>
                </div>

                <div className="flex flex-col">
                    <span className="text-[0.8rem] font-semibold text-gray-100 overflow-hidden whitespace-nowrap text-ellipsis w-20">{username}</span>
                    <span className="text-[0.65rem] text-gray-400">#{hash}</span>
                </div>

                <div className="flex items-center justify-center mr-2">
                    <div onClick={mute} className="icons group">
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