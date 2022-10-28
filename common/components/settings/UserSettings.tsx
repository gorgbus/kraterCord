import { ChangeEvent, Dispatch, FC, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import Modal from "../Modal";
import { useUserStore } from "@kratercord/common/store/user";
import useUtil from "@kratercord/common/hooks/useUtil";
import { uploadFile } from "@kratercord/common/api";
import ToggleLabel from "./ToggleLabel";
import UnsavedWarning from "./UnsavedWarning";
import ProfileCard from "@kratercord/common/components/profile/ProfileCard";
import { useSettings } from "@kratercord/common/store/settings";
import { AcceptIcon, DropDownIcon } from "../Icons";
import { useMember, useUser } from "@kratercord/common/hooks";
import { BaseProps, Optional } from "../../types";

const UserSettings: FC<{ set: Dispatch<SetStateAction<string>>; }> = ({ set }) => {
    const unsaved = useSettings(state => state.unsaved);

    return (
        <div className="text-gray-300">
            <span className="ml-2 text-sm font-bold uppercase">Uživatelské nastavení</span>

            <button disabled={unsaved} onClick={() => set('ucet')} className="item">Můj účet</button>
            <button disabled={unsaved} onClick={() => set('profil')} className="item">Profily</button>
            <button disabled={unsaved} onClick={() => set('zadosti')} className="item">Žádosti o přátelství</button>
        </div>
    )
}

export default UserSettings;

interface AccountProps extends Optional<Optional<BaseProps, "navigate">, "params"> {
    set: Dispatch<SetStateAction<string>>;
}

export const Account: FC<AccountProps> = ({ set, Image }) => {
    const username = useUserStore(state => state.user.username);
    const avatar = useUserStore(state => state.user.avatar);
    const banner = useUserStore(state => state.user.background);
    const hash = useUserStore(state => state.user.hash);
    const members = useUserStore(state => state.user.members);

    const [saving, setSaving] = useState(false);
    const [name, setName] = useState(username);
    const [visModal, setVisibility] = useState(false);

    const { updateUser } = useUser();

    const discard = () => {
        setVisibility(false);
        setName(username);
    }

    const updateName = async () => {
        setSaving(true);

        if (name === username) return setVisibility(false);

        // socket?.emit('update_user', updatedUser);
        const voiceChannelId = members.find(m => m.channels.length > 0)?.channels[0].id;

        updateUser({
            username: name
        }, voiceChannelId);

        setVisibility(false);
        setSaving(false);
    }

    return (
        <div className="relative m-4 mt-0 w-[calc(100%-2rem)] h-[calc(100%-1rem)]">
            <h1 className="text-lg font-semibold text-gray-100">Můj účet</h1>

            <div className="flex flex-col w-full mt-2 rounded-md h-60 bg-amber-200">
                <div className="w-full overflow-hidden h-28">
                    {banner && <Image className="w-full rounded-t-md" width={600} height={240} src={banner} alt={`${username}:profile-banner`} />}
                </div>

                <div className="w-full h-32 bg-gray-900 rounded-b-md">
                    <div className="flex w-full">
                        <div className="relative ml-2 -mt-4">
                            <Image width={68} height={68} className="border-4 border-gray-900 w-[calc(4rem+4px)] h-[calc(4rem+4px)] rounded-full" alt="avatar-settings" src={avatar} />
                        </div>

                        <div className="mt-2 ml-2">
                            <span className="font-semibold text-gray-100">{username}</span>
                            <span className="font-semibold text-gray-400">#{hash}</span>
                        </div>

                        <button onClick={() => set('profil')} className="h-8 pl-2 pr-2 mt-2 ml-auto mr-3 text-sm font-semibold text-gray-100 transition-all bg-blue-700 rounded hover:bg-blue-600">Upravit uživatelský profil</button>
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
                            <input type="text" minLength={3} maxLength={32} onChange={(e) => setName(e.target.value)} value={name} className='w-full p-2 text-sm text-gray-100 bg-gray-900 rounded focus:outline-none' />
                        </div>
                    </div>

                    <div className="flex items-center justify-end w-full h-16 bg-gray-800 rounded-b-md">
                        <button disabled={saving} onClick={discard} className="mr-4 text-sm font-semibold text-gray-100">Zrušit</button>
                        <button disabled={saving} onClick={updateName} className="flex items-center justify-center p-2 pl-2 pr-2 ml-2 mr-2 text-sm font-semibold text-gray-100 bg-blue-600 rounded hover:bg-blue-700">Hotovo</button>
                    </div>
                </>
            } />}
        </div>
    )
}

export const Profiles: FC<Optional<BaseProps, "navigate">> = ({ params, Image }) => {
    const { channelId } = params;

    const userAbout = useUserStore(state => state.user.about);
    const username = useUserStore(state => state.user.username);
    const hash = useUserStore(state => state.user.hash);
    const userAvatar = useUserStore(state => state.user.avatar);
    const userBanner = useUserStore(state => state.user.background);
    const guilds = useUserStore(state => state.user.guilds);
    const members = useUserStore(state => state.user.members);
    const unsaved = useSettings(state => state.unsaved);

    const [profile, selectProfile] = useState("user");
    const [about, setAbout] = useState(userAbout);
    const [banner, setBanner] = useState<File>();
    const [avatar, setAvatar] = useState<File>();
    const [saving, setSaving] = useState(false);
    const [removedBanner, removeBanner] = useState(false);
    const [removedAvatar, removeAvatar] = useState(false);
    const [dropDown, toggleDropDown] = useState(false);
    const [selectedGuild, selectGuild] = useState(guilds[0]);

    const background = banner && URL.createObjectURL(banner);
    const profileAvatar = avatar && URL.createObjectURL(avatar);

    const aboutRef = useRef() as MutableRefObject<HTMLTextAreaElement>;
    const bannerRef = useRef() as MutableRefObject<HTMLInputElement>;
    const avatarRef = useRef() as MutableRefObject<HTMLInputElement>;

    const member = selectedGuild && members.find(member => member.guildId === selectedGuild.id);
    const [nickname, setNickname] = useState(member?.nickname);

    const { updateMember } = useMember();
    const { updateUser } = useUser();

    const onFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
        e.preventDefault();

        if (!e.target.files) return;

        if (e.target.files[0].size > 1024 * 1024 * 10) return alert('Soubor je vetší než 10MB');

        (type === "avatar") ? setAvatar(e.target.files[0]) : setBanner(e.target.files[0]);
    }

    const removeBannerFn = (preview: boolean) => {
        setBanner(undefined);

        if (preview) return;

        removeBanner(true);
    }

    const removeAvatarFn = (preview: boolean) => {
        setAvatar(undefined);

        if (preview) return;

        removeAvatar(true);
    }

    const discard = () => {
        setAbout(userAbout);
        setBanner(undefined);
        setAvatar(undefined);
        removeBanner(false);
        removeAvatar(false);
        setNickname(member?.nickname);
        aboutRef.current.value = "";
    }

    const uploadProfileFiles = async (): Promise<{ newBanner?: string; newAvatar?: string; }> => {
        let newBanner: string | undefined;
        let newAvatar: string | undefined;

        if (banner) {
            const formData = new FormData();
            formData.append("file", banner);

            const link = await uploadFile(formData);

            if (link) newBanner = link;
        }

        if (avatar) {
            const formData = new FormData();
            formData.append("file", avatar);

            const link = await uploadFile(formData);

            if (link) newAvatar = link;
        }

        return { newBanner, newAvatar };
    }

    const save = async () => {
        setSaving(true);

        const { newBanner, newAvatar } = await uploadProfileFiles();

        const voiceChannelId = members.find(m => m.channels.length > 0)?.channels[0].id;

        updateUser({
            background: removedBanner ? null! : newBanner,
            about,
            avatar: removedAvatar ? null! : newAvatar
        }, voiceChannelId);

        setSaving(false);
        setBanner(undefined);
        setAvatar(undefined);
    }

    const saveMember = async () => {
        setSaving(true);

        const { newBanner, newAvatar } = await uploadProfileFiles();

        const voiceChannelId = member?.channels[0].id;

        updateMember(selectedGuild.id, member?.id!, {
            background: removedBanner ? null! : newBanner,
            avatar: removedAvatar ? null! : newAvatar,
            nickname: nickname?.length! < 1 ? null! : nickname
        }, channelId as string | undefined, voiceChannelId);

        setSaving(false);
        setBanner(undefined);
        setAvatar(undefined);
    }

    useEffect(() => {
        setNickname(member?.nickname);
    }, [selectedGuild]);

    return (
        <div className="relative m-4 mt-0 h-[calc(100%-1rem)]">
            <h1 className="text-lg font-semibold text-gray-100">Profily</h1>

            <div className="w-full border-b-[1px] h-12 border-gray-500 flex items-center font-semibold mb-4">
                <button disabled={unsaved} onClick={() => selectProfile("user")} className={`h-full text-gray-300 ${profile === "user" ? "border-blue-400 border-b-[1px] cursor-default text-gray-100" : "hover:border-blue-600 hover:border-b-[1px] hover:text-gray-200"}`}>Uživatelský profil</button>
                {guilds.length > 0 && <button disabled={unsaved} onClick={() => selectProfile("server")} className={`h-full ml-4 text-gray-300 ${profile === "server" ? "border-blue-400 border-b-[1px] cursor-default text-gray-100" : "hover:border-blue-600 hover:border-b-[1px] hover:text-gray-200"}`}>Profily serverů</button>}
            </div>

            {
                profile === "user" ?
                    <div className="flex justify-between">
                        <div className="w-1/2">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase">avatar</h3>

                            <div className="flex items-center mt-2">
                                <input disabled={saving} type="file" className="hidden" accept="image/*" ref={avatarRef} onChange={(e) => onFileChange(e, "avatar")} />
                                <button onClick={() => avatarRef.current.click()} className="p-2 text-sm font-semibold text-gray-100 transition-all bg-blue-700 rounded hover:bg-blue-600">Změnit avatar</button>
                                {((avatar || userAvatar) && !removedAvatar) && <button disabled={saving} onClick={() => removeAvatarFn(!!avatar)} className="p-2 ml-2 text-sm font-semibold text-gray-100">Odebrat avatar</button>}
                            </div>

                            <Divider />

                            <h3 className="text-xs font-semibold text-gray-400 uppercase">banner profilu</h3>
                            <p className="text-xs font-semibold text-gray-400">Doporučujeme obrázek veliký aspoň 600x240. Můžes nahrát PNG, JPG nebo GIF do 10MB.</p>

                            <div className="flex items-center mt-2">
                                <input disabled={saving} type="file" className="hidden" accept="image/*" ref={bannerRef} onChange={(e) => onFileChange(e, "banner")} />
                                <button onClick={() => bannerRef.current.click()} className="p-2 text-sm font-semibold text-gray-100 transition-all bg-blue-700 rounded hover:bg-blue-600">Změnit banner</button>
                                {((banner || userBanner) && !removedBanner) && <button disabled={saving} onClick={() => removeBannerFn(!!banner)} className="p-2 ml-2 text-sm font-semibold text-gray-100">Odebrat banner</button>}
                            </div>

                            <Divider />

                            <h3 className="text-xs font-semibold text-gray-400 uppercase">o mně</h3>
                            <div className="w-full h-32 p-2 mt-2 overflow-x-hidden overflow-y-scroll rounded bg-gray-850 thin-scrollbar">
                                <textarea ref={aboutRef} className="break-words w-[14rem] max-w-[40ch] text-sm text-gray-300 resize-none focus:outline-none bg-transparent" onChange={(e) => setAbout(e.target.value)} value={about || ""} maxLength={255} name="about" id="about" rows={10}></textarea>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase">náhled</h3>

                            <ProfileCard Image={Image} close={() => { }} customClass="mt-2" user={{ username, hash, avatar: removedAvatar ? undefined : profileAvatar || userAvatar, about: about || "", banner: removedBanner ? undefined : background || userBanner }} />
                        </div>
                    </div>
                    :
                    <>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase">vyber si server</h3>
                        <div className={`relative mt-1 flex items-center justify-between w-full p-2 bg-gray-900 cursor-pointer h-9 ${dropDown ? 'rounded-t-md' : 'rounded-md'}`} onClick={() => toggleDropDown(prev => !prev)}>
                            <span className="text-sm font-semibold text-gray-100">{selectedGuild.name}</span>
                            <DropDownIcon color={`text-gray-100 ${dropDown && 'rotate-180'}`} size="20" />

                            <div className={`absolute flex z-50 flex-col items-center top-full left-0 w-full rounded-b-md bg-gray-600 ${dropDown ? 'block' : 'hidden'}`}>
                                {
                                    guilds.map((guild, i, arr) => {
                                        const selected = selectedGuild.id === guild.id;
                                        const isLast = arr.length - 1 === i

                                        return (
                                            <div className={`flex items-center justify-between w-full h-10 p-2 ${isLast && 'rounded-b-md'} ${selected ? 'bg-gray-500' : 'bg-gray-600'}`} key={i} onClick={() => !unsaved && selectGuild(guild)}>
                                                <span className="w-10/12 text-sm font-semibold text-gray-100">{guild.name}</span>
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

                        <Divider />

                        <div className="flex justify-between">
                            <div className="w-1/2">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase">přezdívka</h3>

                                <input maxLength={32} onChange={(e) => setNickname(e.target.value)} value={nickname || ""} className="w-full p-2 mt-2 text-sm text-gray-100 bg-gray-900 rounded focus:outline-none" type="text" />

                                <Divider />

                                <h3 className="text-xs font-semibold text-gray-400 uppercase">avatar</h3>

                                <div className="flex items-center mt-2">
                                    <input disabled={saving} type="file" className="hidden" accept="image/*" ref={avatarRef} onChange={(e) => onFileChange(e, "avatar")} />
                                    <button onClick={() => avatarRef.current.click()} className="p-2 text-sm font-semibold text-gray-100 transition-all bg-blue-700 rounded hover:bg-blue-600">Změnit avatar</button>
                                    {((avatar || member?.avatar) && !removedAvatar) && <button disabled={saving} onClick={() => removeAvatarFn(!!avatar)} className="p-2 ml-2 text-sm font-semibold text-gray-100">Odebrat avatar</button>}
                                </div>

                                <Divider />

                                <h3 className="text-xs font-semibold text-gray-400 uppercase">banner profilu</h3>
                                <p className="text-xs font-semibold text-gray-400">Doporučujeme obrázek veliký aspoň 600x240. Můžes nahrát PNG, JPG nebo GIF do 10MB.</p>

                                <div className="flex items-center mt-2">
                                    <input disabled={saving} type="file" className="hidden" accept="image/*" ref={bannerRef} onChange={(e) => onFileChange(e, "banner")} />
                                    <button onClick={() => bannerRef.current.click()} className="p-2 text-sm font-semibold text-gray-100 transition-all bg-blue-700 rounded hover:bg-blue-600">Změnit banner</button>
                                    {((banner || member?.background) && !removedBanner) && <button disabled={saving} onClick={() => removeBannerFn(!!banner)} className="p-2 ml-2 text-sm font-semibold text-gray-100">Odebrat banner</button>}
                                </div>

                                <Divider />

                                <h3 className="text-xs font-semibold text-gray-400 uppercase">o mně</h3>
                                <div className="w-full h-32 p-2 mt-2 overflow-x-hidden overflow-y-scroll rounded bg-gray-850 thin-scrollbar">
                                    <textarea ref={aboutRef} className="break-words w-[14rem] max-w-[40ch] text-sm text-gray-300 resize-none focus:outline-none bg-transparent" onChange={(e) => setAbout(e.target.value)} value={about || ""} maxLength={255} name="about" id="about" rows={10}></textarea>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase">náhled pro {selectedGuild.name}</h3>

                                <ProfileCard Image={Image} close={() => { }} customClass="mt-2 float-right" preview={true} member={member} user={{ username, hash, avatar: removedAvatar ? undefined : profileAvatar!, about: about || "", banner: removedBanner ? undefined : background, nickname }} />
                            </div>
                        </div>
                    </>
            }

            {profile === "user" && (about !== userAbout || banner || (removedBanner && userBanner) || avatar || (removedAvatar && userAvatar)) && <UnsavedWarning save={save} discard={discard} saving={saving} />}
            {profile === "server" && (about !== userAbout || nickname !== member?.nickname || banner || (removedBanner && member?.background) || avatar || (removedAvatar && member?.avatar)) && <UnsavedWarning save={saveMember} discard={discard} saving={saving} />}
        </div>
    )
}

export const Requests: FC = () => {
    const { getSettings } = useUtil();

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

const Divider: FC = () => {
    return <div className="w-full h-[1px] mt-4 mb-4 bg-gray-500"></div>
}