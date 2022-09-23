import { FC, useEffect, useState } from "react";
import Img from "react-cool-img";
import { useMutation, useQueryClient } from "react-query";
import Settings from "../../pages/settings/Settings";
import { useSettings } from "../../store/settings";
import { useSocket } from "../../store/socket";
import { Channel, useUser } from "../../store/user";
import { leaveChannel } from "../../utils/api";
import { disconnectSocket } from "../../utils/vcLogic";
import { ConnectionIcon, DeafenHeadphoneIcon, HeadphoneIcon, LeaveCallIcon, MicIcon, MutedMicIcon, SettingsIcon } from "../ui/Icons";

const UserProfile: FC = () => {
    const openSettings = useSettings(state => state.openSettings);
    const open = useSettings(state => state.open);
    const userId = useUser(state => state.user.id);
    const avatar = useUser(state => state.user.avatar);
    const username = useUser(state => state.user.username);
    const hash = useUser(state => state.user.hash);
    const guilds = useUser(state => state.user.guilds);
    const guild = useSettings(state => state.voiceGuild);
    const voice = useSettings(state => state.voiceChannel);
    const socket = useSocket(state => state.socket);
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

    const voiceChannel = channels?.find(c => c.id === voice);
    const voiceGuild = guilds.find(g => g.id === guild);

    const { mutate } = useMutation(leaveChannel, {
        onMutate: async (channelId) => {
            await queryClient.cancelQueries(['channels', guild]);

            const cache = queryClient.getQueryData<Channel[]>(["channels", guild]);

            if (!cache) return;

            const newCache = cache;

            const index = newCache.findIndex(c => c.id === channelId);

            if (index === -1) return;

            newCache[index].members = newCache[index].members.filter(u => u.id !== userId);

            queryClient.setQueryData(["channels", guild], newCache);

            socket?.emit("leave_channel", guild, channelId, userId);

            return { cache };
        },
        onError: (_error, _data, context: any) => {
            queryClient.setQueryData(["channels", guild], context?.cache);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['channels', guild]);
        }
    });

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

        switch(status) {
            case 'connected':
                return 'text-green-500';
            case 'connecting':
                return 'text-orange-500';
            case 'failed':
                return 'text-red-500';
            case 'closed':
                return 'text-red-500';
            case 'disconnected':
                return 'text-red-500';
            default:
                return 'text-orange-500';
        }
    }

    const voiceStatusText = (status: string) => {
        if (leaving) return 'Odpojeno';

        switch(status) {
            case 'connected':
                return 'Hlas připojen';
            case 'connecting':
                return 'Připojování'; 
            case 'failed':
                return 'Odpojeno';
            case 'closed':
                return 'Odpojeno';
            case 'disconnected':
                return 'Odpojeno';
            default:
                return 'Připojování';
        }
    }

    useEffect(() => {
        if (!leaving && voiceStatus !== 'disconnected') return;
        
        setProducer('none');
        setVoice('none');
        setVoiceGuild('none');
        setTalkingUsers([]);

        mutate(voice);

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