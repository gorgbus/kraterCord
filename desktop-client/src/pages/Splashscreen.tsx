import { invoke } from '@tauri-apps/api/tauri';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { getVersion } from '@tauri-apps/api/app';
import { relaunch } from '@tauri-apps/api/process';
import { FC, useEffect, useState } from 'react';
import Img from 'react-cool-img';

let version: string;

const SplashScreen: FC = () => {
    const [update, setUpdate] = useState('Vyhledávání aktualizací...');

    useEffect(() => {
        (async () => {
            try {
                version = await getVersion();

                const { shouldUpdate } = await checkUpdate()
                
                if (shouldUpdate) {
                    // display dialog
                    setUpdate('Nalezena aktualizace. Instalace...')
                    await installUpdate()
                    // install complete, restart app
                    setUpdate('Instalace proběhla úspěšně. Restartování aplikace...')
                    await relaunch()
                }

                setUpdate('');

                setTimeout(() => {
                    invoke('close_splashscreen');
                }, 1000);
            } catch (error) {
                console.error(error)
            }
        })();
    }, []);

    return (
        <div className='flex flex-col items-center justify-center h-screen font-semibold text-gray-100 bg-gray-800'>
            <Img className='w-32 h-32 rounded-md' src='/images/kratercord.png' />
            <span className='m-4 mt-2 text-xs text-gray-500'>KraterCord - v{version || 'idk'}</span>
            {update}
        </div>
    )
}

export default SplashScreen;