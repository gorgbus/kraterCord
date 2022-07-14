import { Dispatch, FC, SetStateAction } from "react";
import { getSettings } from "../../utils";
import ToggleLabel from "./ToggleLabel";

const AppSettings: FC<{ set: Dispatch<SetStateAction<string>>; }> = ({ set }) => {
    return (
        <div className="mt-2 text-gray-300">
            <div className="h-[2px] ml-2 mt-2 bg-gray-600 w-48"></div>

            <span className="ml-2 text-sm font-bold uppercase">Nastavení aplikace</span>

            <button onClick={() => set('hlas')} className="item">Hlas a video</button>
            <button onClick={() => set('oznameni')} className="item">Oznámení</button>
            <button onClick={() => set('windows')} className="item">Nastavení Windows</button>

            <div className="h-[2px] ml-2 bg-gray-600 mt-2 w-48"></div>

            <button className="item hover:text-red-500 hover:bg-transparent">Odhlásit se</button>
        </div>
    )
}

export default AppSettings;

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