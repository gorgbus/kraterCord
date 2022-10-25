import { Message } from "../types";

const useUtil = () => {
    type group = {
        nextId: string;
        messages: Message[];
    }

    const isCompact = (pages: group[], group: group, msg: Message, i: number) => {
        if (pages[pages.length - 1] === group && group.messages[group.messages.length - 1] === msg) {
            return false;
        }

        if (group.messages[group.messages.length - 1] !== msg) {
            if (msg.author.id !== group.messages[i + 1].author.id) return false;

            if ((Number(new Date(msg.createdAt)) - Number(new Date(group.messages[i + 1].createdAt))) <= 1000 * 60) {
                return true;
            }

            return false;
        }

        i = pages.indexOf(group);

        if (group.messages[group.messages.length - 1] === msg) {
            if (msg.author.id !== pages[i + 1].messages[0].author.id) return false;

            if ((Number(new Date(msg.createdAt)) - Number(new Date(pages[i + 1].messages[0].createdAt))) <= 1000 * 60) {
                return true;
            }

            return false;
        }

        return false;
    }

    const isLast = (pages: group[], group: group, msg: Message, i: number) => {
        if (pages[0].messages[0] === msg) {
            return true;
        }

        if (group.messages[0] !== msg) {
            if (msg.author.id !== group.messages[i - 1].author.id) return false;

            if ((Number(new Date(msg.createdAt)) - Number(new Date(group.messages[i - 1].createdAt))) <= 1000 * 60) {
                return false;
            }

            return true;
        }

        i = pages.indexOf(group);

        if (group.messages[0] === msg) {
            if (msg.author.id !== pages[i - 1].messages[0].author.id) return false;

            if ((Number(new Date(msg.createdAt)) - Number(new Date(pages[i - 1].messages[0].createdAt))) <= 1000 * 60) {
                return false;
            }

            return true;
        }

        return true;
    }

    type Settings = {
        everyone: boolean;
        friends: boolean;
        nfSound: boolean;
        nfPopup: boolean;
        startup: boolean;
        startupSilent: boolean;
        minimize: boolean;
        audioInput: string;
    }

    const getSettings = () : Settings | undefined => {

        const settings = localStorage.getItem('settings');

        if (settings) {
            return JSON.parse(settings);
        }

        return undefined;
    }

    const checkSettings = () => {
        const settings = {
            everyone: true,
            friends: true,
            nfSound: true,
            nfPopup: true,
            startup: false,
            startupSilent: false,
            minimize: true,
            audioInput: 'default'
        } as any

        let storageSettings: any = localStorage.getItem('settings');

        if (storageSettings) {
            storageSettings = JSON.parse(storageSettings) as Settings | undefined;

            if (storageSettings) {
                let hasAll = true;

                Object.keys(settings).map(key => {
                    if (key in storageSettings) {
                        storageSettings[key] = settings[key];
                        hasAll = false;
                    }
                });

                if (!hasAll) return localStorage.setItem('settings', JSON.stringify(storageSettings));

                return;
            }
        }

        localStorage.setItem('settings', JSON.stringify(settings));
    }


    const setSetting = (key: string, value: boolean | string) => {
        const settings: any = getSettings();

        if (settings && typeof settings !== 'boolean') {
            if (settings[key] === value || typeof settings[key] === 'undefined') return;

            settings[key] = value;
            localStorage.setItem('settings', JSON.stringify(settings));
        }
    }

    const playSound = (sound: string, loop: boolean) : HTMLAudioElement | undefined => {
        const settings = getSettings() as any;

        if (settings && settings[sound] === false) return undefined;

        const audio = new Audio(`/sounds/${sound}.mp3`);

        audio.loop = loop;
        audio.play();

        audio.onended = () => {
            audio.remove();
        }

        return audio;
    }

    return { isCompact, isLast, checkSettings, getSettings, setSetting, playSound }
}

export default useUtil;