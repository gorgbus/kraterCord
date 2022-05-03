import Image from "next/image";
import { ChangeEvent, FC, MouseEvent, MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { uploadFile } from "../utils/api";
import { UserContext } from "../utils/contexts/UserContext";
import FormData from 'form-data';
import style from "./settings.module.scss";
import { ChannelContext } from "../utils/contexts/ChannelContext";
import { member } from "../utils/types";

interface Props {
    visible: boolean;
}

const Settings: FC<Props> = ({ visible }) => {
    const { setVisible, user, setUser, users, setUsers } = useContext(UserContext);
    const { socket } = useContext(ChannelContext);

    const [item, setItem] = useState<number>(1);
    const [file, setFile] = useState<File>();
    const [upload, setUpload] = useState<boolean>(true);
    const [name, setName] = useState<string>("");
    const [nameEn, setNameEn] = useState<boolean>(true);

    const settingsRef = useRef() as MutableRefObject<HTMLDivElement>;
    const uploadRef = useRef() as MutableRefObject<HTMLInputElement>;
    const nameRef = useRef() as MutableRefObject<HTMLDivElement>;
    const boxNameRef = useRef() as MutableRefObject<HTMLDivElement>;
    const inputRef = useRef() as MutableRefObject<HTMLInputElement>;
    const warnRef = useRef() as MutableRefObject<HTMLSpanElement>;

    const url = file && URL.createObjectURL(file);

    const notifs = {
        notificationSound: "Zpráva",
        test: "negr"
    }

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.target.files && e.target.files[0].size > 1024 * 1024 * 20) {
            e.target.value = "";
            return alert("Soubor je vetší než 20MB");
        }

        e.target.files && setFile(prev => e.target.files![0]);
    }

    const handleUpload = () => {
        uploadRef.current.click();
    }

    const vis = () => {
        if (file || name.length > 1) {
            return true;
        }

        return false;
    }

    const discard = () => {
        uploadRef.current.value = "";
        setFile(undefined!);
    }

    const save = async () => {
        if (!user) return;

        let tempUser = user;

        setUpload(false);
        setNameEn(false);

        if (file) {
            const formData = new FormData();
            formData.append("file", file);

            const link = await uploadFile(formData)

            if (link) {
                tempUser.avatar = link;
            }
        }

        if (name !== user.username && name.length > 1) {
            tempUser.username = name;
        }

        const index = users.findIndex(u => u._id === user._id);
        const tempUsers = users

        if (index !== -1) {
            tempUsers[index] = tempUser;
            setUsers(tempUsers);
        }
        
        socket?.emit("update_user", tempUser);
        setUser(tempUser);
        uploadRef.current.value = "";
        setFile(undefined!);
        setName("");
        setUpload(true);
        setNameEn(true);
    }

    const closeModal = (e) => {
        if (boxNameRef.current && !boxNameRef.current.contains(e.target)) {
            nameRef.current.style.display = "none";
            warnRef.current.style.display = "none";
            inputRef.current.value = user?.username || "";
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", closeModal);
    }, []);

    const getSettings = (item: number) => {
        switch(item) {
            case 1:
                return (
                    <div className={style.account}>
                        <h2>Můj účet</h2>

                        <div className={style.account_box}>
                            <div className={style.profile_box}>
                                <div className={style.profile}>
                                    <input type="file" accept="image/*" ref={uploadRef} style={{ display: "none" }} onChange={onFileChange} />
                                    <div className={style.avatar_wrapper} onClick={handleUpload}>
                                        <Image className={style.avatar} src={url || user?.avatar || "https://cdn.discordapp.com/attachments/805393975900110852/966738727386894346/unknown.png"} width={64} height={64} quality={90} />
                                        
                                        <div className={style.overlay}>
                                            <span>změnit</span>
                                            <span>avatar</span>
                                        </div>
                                    </div>

                                    <div className={style.username}>
                                        <span>{user?.username}</span>
                                        <span>#{user?.hash}</span>
                                    </div>
                                </div>

                                <div className={style.profile_info}>
                                    <div className={style.username_info}>
                                        <span className={style.caption}>uživatelské jméno</span>

                                        <div className={style.username}>
                                            <span>{user?.username}</span>
                                            <span>#{user?.hash}</span>
                                        </div>
                                    </div>

                                    <button onClick={() => nameRef.current.style.display = "flex"}>
                                        Upravit
                                    </button>

                                    <div className={style.edit_name} ref={nameRef} >
                                        <div className={style.box} ref={boxNameRef}>
                                            <div className={style.info}>
                                                <span>Uprav své uživatelské jméno</span>
                                                <span>Zadej nové uživatelské jméno</span>
                                            </div>

                                            <div className={style.input}>
                                                <span>Uživatelské jméno</span>
                                                <input ref={inputRef} type="text" placeholder={user?.username} onChange={(e) => setName(e.target.value)}/>
                                                <span ref={warnRef} className={style.warning}>Nesmíš mít jméno kratší než 2 znaky nebo delší než 32 znaků</span>
                                            </div>

                                            <div className={style.footer}>
                                                <button onClick={() => {
                                                    nameRef.current.style.display = "none";
                                                    warnRef.current.style.display = "none";
                                                    inputRef.current.value = user?.username || "";
                                                }}>Zrušit</button>
                                                <button onClick={() => {
                                                    if (name.length < 2) return warnRef.current.style.display = "block";
                                                    nameRef.current.style.display = "none";
                                                }} disabled={!nameEn} className={style.done}>{nameEn ? "Hotovo" : (<div className={style.loading}><span></span> <span></span> <span></span></div>)}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className={style.notifications}>
                        <h2>Zvuky</h2>
                        {
                            Object.keys(JSON.parse(localStorage.getItem("settings")!)).map((key, i) => {
                                let notif = JSON.parse(localStorage.getItem("settings")!)[key];
                                const str = notifs[key];

                                return (
                                    <div className={style.notification} key={i}>
                                        <span>{str}</span>
                                        <input onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            const temp = JSON.parse(localStorage.getItem("settings")!);
                                            temp[key] = e.target.checked;
                                            localStorage.setItem("settings", JSON.stringify(temp));
                                        }} defaultChecked={notif} type="checkbox" id={`switch${i}`} className={style.toggle} />
                                        <label htmlFor={`switch${i}`}>Toggle</label>
                                    </div>
                                )
                            })
                        }
                    </div>
                )
        }
    }

    return (
        <div className={style.container} ref={settingsRef} style={visible ? { display: "flex" } : { display: "none" }}>
            <div className={style.list}>
                <div className={style.column}>
                    <span className={style.title}>Uživatelská nastavení</span>
                    <div className={style.list_container}>
                        <ul>
                            <li className={`${item === 1 && style.selected}`} onClick={() => setItem(1)}>Můj účet</li>
                        </ul>
                    </div>

                    <span className={style.title}>Nastavení aplikace</span>
                    <div className={style.list_container}>
                        <ul>
                            <li className={`${item === 2 && style.selected}`} onClick={() => setItem(2)}>Oznámení</li> 
                        </ul>
                    </div>
                </div>
            </div>

            <div className={style.settings}>
                {getSettings(item)}
                <div className={style.close} onClick={() => {
                    if (vis()) return;

                    settingsRef.current.style.transform = "scale(1.2)";
                    settingsRef.current.style.opacity = "0";
                    setTimeout(() => {
                        setVisible(false);
                        uploadRef.current ? uploadRef.current.value = "" : null;
                        setFile(undefined!);
                        setUpload(true);
                        settingsRef.current.style.transform = "scale(1)";
                        settingsRef.current.style.opacity = "1";
                    }, 140);
                }}>
                    <div className={style.icon_wrapper}>
                        <AiOutlineCloseCircle size={36} />
                        <span>esc</span>
                    </div>
                </div>
            </div>

            <div className={style.save} style={vis() ? { display: "flex" } : { display: "none" }}>
                <span>Máš neuložené změny!</span>

                <button className={style.other} onClick={discard}>Obnovit</button>
                <button disabled={!upload} onClick={save}>{upload ? "Uložit změny" : (<div className={style.loading}><span></span> <span></span> <span></span></div>)}</button>
            </div>
        </div>
    )
}

export default Settings;