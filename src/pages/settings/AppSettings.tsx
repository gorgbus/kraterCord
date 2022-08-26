import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcceptIcon, DropDownIcon } from "../../components/ui/Icons";
import { useChannel } from "../../store/channel";
import { useSettings } from "../../store/settings";
import { useSocket } from "../../store/socket";
import { getSettings, setSetting } from "../../utils";
import { logout } from "../../utils/api";
import { loadDevice } from "../../utils/vcLogic";
import ToggleLabel from "./ToggleLabel";
import UnsavedWarning from "./UnsavedWarning";

const AppSettings: FC<{ set: Dispatch<SetStateAction<string>>; }> = ({ set }) => {
    const navigate = useNavigate();
    const closeSettings = useSettings(state => state.closeSettings);

    const handleLogout = async () => {
        const logedOut = await logout();

        if (logedOut) {
            navigate('/');
            closeSettings();
        } else {
            alert('Něco se nepovedlo');
        }
    }

    return (
        <div className="mt-2 text-gray-300">
            <div className="h-[2px] ml-2 mt-2 bg-gray-600 w-48"></div>

            <span className="ml-2 text-sm font-bold uppercase">Nastavení aplikace</span>

            <button onClick={() => set('hlas')} className="item">Hlas a video</button>
            <button onClick={() => set('oznameni')} className="item">Oznámení</button>
            <button onClick={() => set('windows')} className="item">Nastavení Windows</button>

            <div className="h-[2px] ml-2 bg-gray-600 mt-2 w-48"></div>

            <button className="item hover:text-red-500 hover:bg-transparent" onClick={handleLogout} >Odhlásit se</button>
        </div>
    )
}

export default AppSettings;

export const VoiceAndVideo: FC = () => {
    const settings = getSettings();

    if (!settings) return <div></div>

    const producer = useSettings(state => state.producer);
    const voice = useChannel(state => state.voice);
    const socket = useSocket(state => state.socket);
    const voiceSocket = useSocket(state => state.voiceSocket);

    const [dropDown, toggleDropDown] = useState(false);
    const [devices, setDevices] = useState<{ label: string; deviceId: string; }[]>([{ label: 'Default', deviceId: 'default' }]);
    const [curDevice, setDevice] = useState(settings.audioInput);
    const [saving, setSaving] = useState(false);

    const save = () => {
        setSaving(true);

        setSetting('audioInput', curDevice);

        if (producer !== 'none' && voice !== 'none') {
            voiceSocket?.emit('swapping_media', () => {
                voiceSocket.emit('setup', voice, loadDevice);
            });
        }

        setSaving(false);
    }

    useEffect(() => {
        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            if (stream) {
                stream.getAudioTracks()[0].stop();

                const devices = await navigator.mediaDevices.enumerateDevices()

                let audioInput = devices.filter(device => device.kind === 'audioinput');
                audioInput = audioInput.filter(device => device.deviceId !== 'default' && device.deviceId !== 'communications');

                setDevices((prev) => {
                    return [...prev, ...audioInput];
                });
            }
        })();
    }, []);

    return (
        <div className="relative w-[calc(100%-2rem)] h-[calc(100%-1rem)] m-4 mt-0">
            <h1 className="text-lg font-semibold text-gray-100">Nastavení hlasu</h1>

            <div className="mt-2">
                <h3 className="text-xs font-semibold text-gray-400 uppercase">vstupní zařízení</h3>
                
                <div onClick={() => toggleDropDown(prev => !prev)} className={`relative mt-1 flex items-center justify-between w-64 p-2 bg-gray-900 cursor-pointer h-9 ${dropDown ? 'rounded-t-md' : 'rounded-md'}`}>
                    <span className="text-sm font-semibold text-gray-100">{devices.find(device => device.deviceId === curDevice)?.label}</span>
                    <DropDownIcon color={`text-gray-100 ${dropDown && 'rotate-180'}`} size="20" />

                    <div className={`absolute flex flex-col items-center top-full left-0 w-64 rounded-b-md bg-gray-600 ${dropDown ? 'block' : 'hidden'}`}>
                        {
                            devices.map((device, i, arr) => {
                                const selected = curDevice === device.deviceId
                                const isLast = arr.length - 1 === i

                                return (
                                    <div key={device.deviceId} onClick={() => setDevice(device.deviceId)} className={`flex items-center justify-between w-64 h-10 p-2 ${isLast && 'rounded-b-md'} ${selected ? 'bg-gray-500' : 'bg-gray-600'}`}>
                                        <span className="w-56 text-sm font-semibold text-gray-100">{device.label}</span>
                                        {
                                            selected &&
                                                <div className="flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                                                    <AcceptIcon size="14" color="text-gray-100" />
                                                </div>
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            {curDevice !== settings.audioInput && <UnsavedWarning save={save} discard={() => setDevice(settings.audioInput)} saving={saving} />}
        </div>
    )
}

export const Notifications: FC = () => {
    const settings = getSettings();

    if (!settings) return <div></div>

    return (
        <div className="m-4 mt-0">
            <h1 className="text-lg font-semibold text-gray-100">Oznámení</h1>

            <ToggleLabel name='nfPopup' value={settings.nfPopup} label='Zapnout oznámení na ploše' />

            <h1 className="mt-4 text-lg font-semibold text-gray-100">Zvuky</h1>
            <ToggleLabel name='nfSound' value={settings.nfSound} label='Zpráva' />
        </div>
    )
}

export const System: FC = () => {
    const settings = getSettings();

    if (!settings) return <div></div>

    return (
        <div className="m-4 mt-0">
            <h1 className="text-lg font-semibold text-gray-100">Nastavení Windows</h1>
            <h3 className="text-xs font-semibold text-gray-400 uppercase">Chování při spuštění systému</h3>

            <ToggleLabel name='startup' value={settings.startup} label='Otevřít kraterCord' desc='kraterCord se spustí, když spustíš počítač' />
            <ToggleLabel name='startupSilent' value={settings.startupSilent} label='Spouštět v liště' desc='kraterCord se spustí na pozadí' />

            <h3 className="mt-4 text-xs font-semibold text-gray-400 uppercase">Tlačítko pro zaveření</h3>

            <ToggleLabel name='minimize' value={settings.minimize} label='Minimalizovat na lištu' desc='Kliknutím na X bude kraterCord schovaný v systémové liště' />
        </div>
    )
}