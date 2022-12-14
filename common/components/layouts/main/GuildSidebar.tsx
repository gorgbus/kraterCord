import { ChangeEvent, FC, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useSocket } from "@kratercord/common/store/socket";
import { useUserStore } from "@kratercord/common/store/user";
import { createGuild, fetchOnLoad, joinGuild } from "@kratercord/common/api";
import { AddIcon, DropDownIcon } from "../../Icons";
import Modal from "../../Modal";
import Sockets from "./Sockets";
import LoadingScreen from "./LoadingScreen";
import { io } from "socket.io-client";
import { BaseProps, Optional } from "../../../types";

interface Props extends BaseProps {
    children: ReactNode;
    web?: boolean;
}

const GuildSidebar: FC<Props> = ({ children, Image, navigate, params, web }) => {
    const [modal, setModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const { guildId } = params;

    const dms = useUserStore(state => state.user.dms);
    const userId = useUserStore(state => state.user.id);
    const guilds = useUserStore(state => state.user.guilds);
    const notifications = useUserStore(state => state.user.notifications);
    const getSocket = useSocket(state => state.getSocket);
    const setSocket = useSocket(state => state.setSocket);
    const setUser = useUserStore(state => state.setUser);

    const queryClient = useQueryClient();

    const { isLoading } = useQuery("main", fetchOnLoad, {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: userId === '123' && web,
        onSuccess: (data) => {
            if (!data) return;

            setUser(data);

            queryClient.invalidateQueries();

            const socket = getSocket();

            if (socket) return;

            const SOCKET = io(process.env.NEXT_PUBLIC_API_URL!, { withCredentials: true });

            setSocket(SOCKET);

            SOCKET.emit("setup", data.guilds.map((g) => g.id));
        }
    });

    useEffect(() => {
        document.oncontextmenu = () => false;
    }, []);

    if (isLoading && userId === '123' && web) {
        const socket = getSocket();

        if (socket) socket.disconnect();

        return <LoadingScreen navigate={navigate} Image={Image} refresh={true} />;
    }

    return (
        <div className="flex w-full h-full overflow-hidden">
            <Sockets params={params} />

            <div className="flex flex-col items-center w-[76px] h-full bg-gray-900 relative">
                <div className="flex flex-col items-center w-full h-[calc(100%_-_4rem)]">
                    <div onClick={() => navigate("/channels/@me")} className={`transition-all m-1 relative cursor-pointer rounded-[50%] group duration-300 h-14 w-14 hover:bg-blue-500 hover:rounded-2xl ${!guildId ? `rounded-2xl bg-blue-500` : `bg-slate-800`}`} >
                        <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-0 group-hover:scale-100 w-7 top-1/2 ${!guildId ? `scale-100 h-10` : `h-6`}`}></span>
                    </div>

                    {
                        notifications.filter(n => !n.guildId).map((n, i) => {
                            const channelId = n.channelId;
                            const dm = dms.find(dm => dm.id === channelId);
                            const friend = dm?.users[0].id === userId ? dm.users[1] : dm?.users[0]

                            return (
                                <div key={i} className={`relative w-14 h-14 m-1 group`} onClick={() => navigate(`/channels/@me/${n.channelId}`)}>
                                    <Image width={56} height={56} className={`mb-2 transition-all duration-300 rounded-[50%] hover:rounded-2xl`} src={friend?.avatar!} alt={`${friend?.username}-notification`} />
                                    <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-100 group-hover:h-6 w-7 top-1/2 h-2`}></span>

                                    <span className="absolute right-0 flex items-center justify-center w-6 h-6 text-xs font-semibold text-gray-100 bg-red-600 border-4 border-gray-900 rounded-full -bottom-1">{n.count}</span>
                                </div>
                            )
                        })
                    }

                    <div className="bg-gray-700 m-1 w-8 h-[0.1rem]"></div>
                    {
                        guilds.map((gld, i) => {
                            const notification = notifications.find(n => n.guildId === gld.id);

                            return (
                                <div className="relative m-1 cursor-pointer w-14 h-14 group" key={i} onClick={() => navigate(`/channels/${gld.id}/${gld.redirectId}`)} >
                                    {
                                        gld.avatar ?
                                            <Image width={56} height={56} className={`mb-2 w-14 h-14 transition-all duration-300 rounded-[50%] hover:rounded-2xl ${guildId === gld.id && `rounded-2xl`}`} src={gld.avatar} alt={gld.name} />
                                            :
                                            <div className={`mb-2 flex justify-center items-center bg-gray-800 w-14 h-14 transition-all duration-300 rounded-[50%] hover:rounded-2xl ${guildId === gld.id && `rounded-2xl`}`}>
                                                <span className="text-xl font-semibold text-gray-100">{gld.name[0]}</span>
                                            </div>
                                    }
                                    <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-0 group-hover:scale-100 w-7 top-1/2 ${guildId === gld.id ? `scale-100 h-10` : notification ? `scale-100 h-2 group-hover:h-6` : `h-6`} `}></span>
                                </div>
                            )
                        })
                    }
                </div>

                <div onClick={() => setModal(true)} className={`transition-all flex items-center justify-center relative cursor-pointer rounded-[50%] group duration-300 h-14 w-14 group hover:bg-green-500 hover:rounded-2xl bg-slate-800`}>
                    <AddIcon size="20" color="text-green-400 group-hover:text-gray-100 transition-all" />
                </div>

                {
                    modal &&
                    <Modal saving={saving} addtionalClassName="bg-gray-200" size="h-1/3 w-[30%]" close={() => setModal(false)} content={<AddGuildModal Image={Image} navigate={navigate} set={(bol: boolean) => setSaving(bol)} close={() => setModal(false)} />} />
                }
            </div>

            <div className="w-[calc(100vw_-_76px)]">
                {children}
            </div>
        </div>
    )
}

export default GuildSidebar;

interface ModalProps extends Optional<BaseProps, "params"> {
    close: () => void;
    set: (bol: boolean) => void;
}

const AddGuildModal: FC<ModalProps> = ({ close, set, Image, navigate }) => {
    const userName = useUserStore(state => state.user.username);
    const userId = useUserStore(state => state.user.id);
    const addGuild = useUserStore(state => state.addGuild);
    const addMember = useUserStore(state => state.addMember);

    const [stage, setStage] = useState('main');
    const [invite, setInvite] = useState('');
    const [serverName, setName] = useState(`Server u??ivatele ${userName}`);
    const [avatar, setAvatar] = useState<File>();
    const [saving, setSaving] = useState(false);
    const [error, toggleError] = useState(false);

    const uploadRef = useRef() as MutableRefObject<HTMLInputElement>;

    const url = avatar && URL.createObjectURL(avatar);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (!e.target.files) return;

        if (e.target.files[0].size > 1024 * 1024 * 20) return alert('Soubor je vet???? ne?? 20MB');

        setAvatar(e.target.files[0]);
    }

    const save = async () => {
        setSaving(true);
        set(true);

        const formData = new FormData();

        if (avatar) formData.append('file', avatar);
        formData.append('serverName', serverName);
        formData.append('userId', userId);

        const res = stage === 'create' ? await createGuild(formData) : await joinGuild(invite.replace('https://krater-cord.tech/invite/', ''), userId);

        if (!res) {
            toggleError(true);
            setSaving(false);
            set(false);

            return;
        }

        const { guild, member } = res;

        addGuild(guild);
        addMember(member);
        navigate(`/channels/${guild.id}/${guild.redirectId}`);

        close();
        set(false);
    }

    return (
        <div className="flex flex-col items-center justify-between w-full h-full font-semibold text-gray-800">
            <div className="w-full h-[calc(100%_-_3.5rem)] flex items-center flex-col justify-center">
                {
                    stage === 'main' &&
                    <div onClick={() => setStage('create')} className="flex items-center justify-between w-4/5 p-2 pl-4 pr-4 transition-all border-2 border-gray-300 rounded-md cursor-pointer hover:bg-gray-300 hover:border-gray-400">
                        <span>Vytvo?? si server</span>
                        <DropDownIcon size="20" color="text-gray-800 -rotate-90" />
                    </div>
                }

                {
                    stage === 'invite' &&
                    <div className="flex flex-col items-start justify-center w-4/5">
                        <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">zvac?? odkaz *</h3>
                        <input disabled={saving} value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="https://krater-cord.tech/invite/nEgrIdk" className="w-full p-2 pl-4 pr-4 text-sm bg-gray-300 rounded-md placeholder:text-sm focus:outline-none" />

                        {error && <h3 className="mt-2 text-xs text-red-500 uppercase">n??co se pokazilo. zkuste to znovu</h3>}
                    </div>
                }

                {
                    stage === 'create' &&
                    <div className="flex flex-col items-center justify-center w-4/5">
                        <input disabled={saving} type="file" className="hidden" accept="image/png,image/gif,image/jpeg" ref={uploadRef} onChange={onFileChange} />

                        {
                            !avatar ?
                                <div onClick={() => uploadRef.current.click()} className="relative flex items-center justify-center w-16 h-16 text-xs text-gray-700 uppercase border-2 border-gray-600 border-dashed rounded-full cursor-pointer">
                                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                                        <AddIcon size="16" color="text-gray-100" />
                                    </span>

                                    ikona
                                </div>
                                :
                                <Image width={64} height={64} onClick={() => uploadRef.current.click()} className="w-16 h-16 rounded-full" src={url!} alt="guild-avatar" />
                        }

                        <div className="flex flex-col items-start justify-center w-full">
                            <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase">n??zev serveru</h3>
                            <input disabled={saving} value={serverName} onChange={(e) => setName(e.target.value)} className="w-full p-2 pl-4 pr-4 text-sm bg-gray-300 rounded-md placeholder:text-sm focus:outline-none" />
                            {error && <h3 className="mt-2 text-xs text-red-500 uppercase">n??co se pokazilo. zkuste to znovu</h3>}
                        </div>
                    </div>
                }
            </div>

            <div className={`flex items-center justify-center w-full bg-gray-300 h-14 rounded-b-md`}>
                {stage === 'main' && <button onClick={() => setStage('invite')} className="w-4/5 p-2 text-gray-100 transition-all bg-gray-400 rounded hover:bg-gray-500">P??ipojit se k serveru</button>}

                {
                    stage !== 'main' &&
                    <div className="flex items-center justify-between w-4/5 h-full">
                        <button disabled={saving} className="font-normal text-gray-400 hover:underline" onClick={() => {
                            setStage('main');
                            setName(`Server u??ivatele ${userName}`);
                            setAvatar(undefined!);
                            setInvite('');
                        }} >Zp??t</button>

                        <button onClick={save} disabled={saving} className="p-2 text-gray-100 bg-blue-500 rounded hover:bg-blue-600">{stage === 'create' ? 'Vytvo??it' : 'P??idat se k serveru'}</button>
                    </div>
                }
            </div>
        </div>
    )
}