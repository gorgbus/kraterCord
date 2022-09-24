import { ChangeEvent, Dispatch, FC, MutableRefObject, SetStateAction, useRef, useState } from "react";
import { LoadingIcon } from "../ui/Icons";
import Modal from "../ui/Modal";
import { useSocket } from "../../store/socket";
import { useUser } from "../../store/user";
import { getSettings } from "../../utils";
import { updateUserApi, uploadFile } from "../../utils/api";
import ToggleLabel from "./ToggleLabel";
import UnsavedWarning from "./UnsavedWarning";
import Image from "next/future/image";

const UserSettings: FC<{ set: Dispatch<SetStateAction<string>>; }> = ({ set }) => {
    return (
        <div className="text-gray-300">
            <span className="ml-2 text-sm font-bold uppercase">Uživatelské nastavení</span>

            <button onClick={() => set('profil')} className="item">Uživatelský profil</button>
            <button onClick={() => set('zadosti')} className="item">Žádosti o přátelství</button>
        </div>
    )
}

export default UserSettings;

export const Profile: FC = () => {
    const userId = useUser(state => state.user.id);
    const username = useUser(state => state.user.username);
    const avatar = useUser(state => state.user.avatar);
    const hash = useUser(state => state.user.hash);
    const setUser = useUser(state => state.updateUser);
    const updateUser = useUser(state => state.updateUser);
    const socket = useSocket(state => state.socket);

    const [image, setImage] = useState<File>();
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(username);
    const [visModal, setVisibility] = useState(false);

    const uploadRef = useRef() as MutableRefObject<HTMLInputElement>;

    const url = image && URL.createObjectURL(image);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (!e.target.files) return;

        if (e.target.files[0].size > 1024 * 1024 * 20) return alert('Soubor je vetší než 20MB');

        setImage(e.target.files[0]);
    }

    const discard = () => {
        uploadRef.current.value = "";
        setImage(undefined);
        setVisibility(false);
        setName(username);
    }

    const save = async () => {
        let avatar: string | undefined = undefined;
        setSaving(true);

        if (image) {
            const formData = new FormData();
            formData.append("file", image);

            const link = await uploadFile(formData);

            if (link) avatar = link;
        }

        const updatedUser = await updateUserApi(userId, undefined!, avatar!);

        if (!updatedUser) return;

        socket?.emit('update_user', updatedUser);

        uploadRef.current.value = "";
        setSaving(false);
        setImage(undefined);
        setUser(updatedUser);
        updateUser(updatedUser);
    }

    const updateName = async () => {
        setSaving(true);

        if (name === username) return setVisibility(false);

        const updatedUser = await updateUserApi(userId, name, undefined!);

        if (!updatedUser) return setVisibility(false);

        socket?.emit('update_user', updatedUser);
        setUser(updatedUser);
        updateUser(updatedUser);

        setVisibility(false);
        setSaving(false);
    }

    return (
        <div className="relative m-4 mt-0 w-[calc(100%-2rem)] h-[calc(100%-1rem)]">
            <h1 className="text-lg font-semibold text-gray-100">Můj účet</h1>

            <div className="flex flex-col-reverse w-full mt-2 rounded-md h-52 bg-amber-200">
                <div className="w-full h-32 bg-gray-900 rounded-b-md">
                    <div className="flex w-full">
                        <input disabled={saving} type="file" className="hidden" accept="image/*" ref={uploadRef} onChange={onFileChange} />

                        <div className="relative ml-2 -mt-4 cursor-pointer group">
                            <Image width={68} height={68} className="border-4 border-gray-900 rounded-full" alt="avatar-settings" src={url || avatar} />
                            <span onClick={() => uploadRef.current.click()} className="absolute items-center justify-center hidden w-[calc(4rem-4px)] h-[calc(4rem-4px)] text-[0.6rem] font-bold text-center text-gray-100 uppercase -translate-x-1/2 -translate-y-1/2 bg-black rounded-full group-hover:flex left-1/2 top-1/2 bg-opacity-70">změnit<br />avatar</span>
                        </div>

                        <div className="mt-2 ml-2">
                            <span className="font-semibold text-gray-100">{username}</span>
                            <span className="font-semibold text-gray-400">#{hash}</span>
                        </div>
                    </div>

                    <div className="flex items-center h-12 m-3 bg-gray-800 rounded-md">
                        <div className="flex items-center justify-between w-full m-2">
                            <div className="flex flex-col">
                                <span className="text-[0.6rem] font-bold text-gray-400 uppercase">Uživatelské jméno</span>

                                <div>
                                    <span className="text-xs font-semibold text-gray-100">{username}</span>
                                    <span className="text-xs font-semibold text-gray-400">#{hash}</span>
                                </div>
                            </div>

                            <button onClick={() => setVisibility(true)} className="h-8 pl-2 pr-2 text-sm text-gray-100 bg-gray-600 rounded hover:bg-gray-500">Upravit</button>
                        </div>
                    </div>
                </div>
            </div>

            {visModal && <Modal close={discard} size='h-2/6 w-[30%]' content={
                <>
                    <div className="flex flex-col items-center h-[calc(100%-4rem)] w-full">
                        <h1 className="mt-4 text-lg font-bold text-gray-100">Uprav své uživatelské jméno</h1>
                        <h3 className="text-sm text-gray-400">Zadej nové uživatelské jméno</h3>

                        <div className="w-[calc(100%-1rem)] m-4">
                            <h4 className="mb-2 text-xs font-semibold text-gray-400 uppercase">uživatelské jméno</h4>
                            <input type="text" minLength={3} maxLength={32} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} value={name} className='w-full p-2 text-sm text-gray-100 bg-gray-900 rounded focus:outline-none' />
                        </div>
                    </div>

                    <div className="flex items-center justify-end w-full h-16 bg-gray-800 rounded-b-md">
                        <button disabled={saving} onClick={discard} className="mr-4 text-sm font-semibold text-gray-100">Zrušit</button>
                        <button disabled={saving} onClick={updateName} className="flex items-center justify-center p-2 pl-2 pr-2 ml-2 mr-2 text-sm font-semibold text-gray-100 bg-blue-600 rounded hover:bg-blue-700">Hotovo</button>
                    </div>
                </>
            } />}

            {url && <UnsavedWarning save={save} discard={discard} saving={saving} />}
        </div>
    )
}

export const Requests: FC = () => {
    const settings = getSettings();

    if (!settings) return <div></div>

    return (
        <div className="m-4 mt-0">
            <h1 className="text-lg font-semibold text-gray-100">Žádosti o přátelství</h1>
            <h3 className="text-xs font-semibold text-gray-400 uppercase">kdo ti může posílat žádosti o přátelství</h3>

            <ToggleLabel name='everyone' value={settings.everyone} label='Všichni' />
            <ToggleLabel name='friends' value={settings.friends} label='Přátelé přátel' />
        </div>
    )
}