import { FC } from "react";
import { appWindow } from '@tauri-apps/api/window';
import { Outlet } from "react-router-dom";
import { getSettings } from "../../../utils";

const TitleBar: FC = () => {
    return (
        <div className="h-[calc(100vh_-_20px)] w-screen flex mt-5">
            <div data-tauri-drag-region className="fixed top-0 left-0 right-0 z-50 flex justify-end h-5 bg-gray-900 select-none">
                <div onClick={() => appWindow.minimize()} className="inline-flex items-center justify-center w-6 h-5 cursor-pointer hover:bg-gray-700" id="titlebar-minimize">
                    <img
                    src="https://api.iconify.design/mdi:window-minimize.svg?color=%23777"
                    alt="minimize"
                    />
                </div>

                <div onClick={() => appWindow.toggleMaximize()} className="inline-flex items-center justify-center w-6 h-5 cursor-pointer hover:bg-gray-700" id="titlebar-maximize">
                    <img
                    src="https://api.iconify.design/mdi:window-maximize.svg?color=%23777"
                    alt="maximize"
                    />
                </div>

                <div onClick={() => {
                    const settings = getSettings();

                    if (!settings) return appWindow.hide();

                    settings.minimize ? appWindow.hide() : appWindow.close();
                }} className="inline-flex items-center justify-center w-6 h-5 cursor-pointer hover:bg-red-500" id="titlebar-close">
                    <img src="https://api.iconify.design/mdi:close.svg?color=%23777" alt="close" />
                </div>
            </div>

            <Outlet />
        </div>
    )
}

export default TitleBar;