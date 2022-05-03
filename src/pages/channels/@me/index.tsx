import { MutableRefObject, ReactElement, useContext, useEffect, useRef, useState } from "react";
import { member, NextPageWithLayout, req } from "../../../utils/types";
import { MainLayout } from "../../../components/layouts/mainLayout";
import { acceptFriendRequest, createChannel, rejectFriendRequest, removeFriend, sendFriendRequest } from "../../../utils/api";
import style from "./main.module.scss";
import { UserContext } from "../../../utils/contexts/UserContext";
import Image from "next/image";
import { MdClose, MdDone } from "react-icons/md";
import { BiMessage } from "react-icons/bi";
import { useRouter } from "next/router";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";

const MainPage: NextPageWithLayout<any> = () => {
    const { setChannel, socket } = useContext(ChannelContext);
    const { user, friendBar, friends, friendReqs, setFriends, setFriendReqs, dms, setDms } = useContext(UserContext);

    const [content, setContent] = useState<string>("");
    const [warning, setWarning] = useState<string>("");

    const warnRef = useRef() as MutableRefObject<HTMLSpanElement>; 
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        setContent(e.target.value);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        warnRef.current.style.color = "red";

        if (content === `${user?.username}#${user?.hash}`) {
            setWarning("Nemůžeš přidat sám sebe");
            return;
        }

        const username = content.slice(0, content.length - 5);
        const hash = content.slice(content.length - 4, content.length);

        if (friends.find(f => f.username === username && f.hash === hash)) {
            setWarning(`Uživatel ${content} už je na tvojem seznamu přátel`);
            return;
        }

        const response = await sendFriendRequest(content, user?._id!);

        setContent("");

        if (response.status === 202) {
            setWarning(`Už jsi poslal žádost o přátelství uživateli ${content}`);
            return;
        }

        if (response.status === 200) {
            warnRef.current.style.color = "var(--green)";
            setWarning(`Žádost o přátelství byla úspěšně odeslána uživateli ${content}`);
            socket?.emit("fr_req", response.data._id, user);
            setFriendReqs([...friendReqs, { friend: response.data, type: "on" }]);
        } else if (response.status === 203) {
            setWarning(`Neznámý uživatel ${content}`);
        }
    }

    const handleCancel = (id: string, friendId: string) => {
        setFriendReqs(friendReqs.filter(f => f.friend._id !== friendId));

        rejectFriendRequest(id, friendId);
        socket?.emit("fr_decline", friendId, user);
    }

    const handleAccept = async (id: string, friendId: string) => {
        const { data: friend } = await acceptFriendRequest(id, friendId);

        if (friend) {
            setFriendReqs(friendReqs.filter(f => f.friend._id !== friendId));

            setFriends([...friends, friend]);
            socket?.emit("fr_accept", friendId, user);
        }
    }

    const handleRemove = async (id: string, friendId: string) => {
        const friend = await removeFriend(id, friendId);

        if (friend) {
            setFriends(friends.filter(f => f._id !== friendId));
            socket?.emit("fr_remove", friendId, user);
        }
    }

    const openDM = async (users: string[]) => {
        const response = await createChannel(users, "dm");

        if (response.data) {
            setChannel(response.data);
            const friend = users[0] === user?._id ? users[1] : users[0];

            if (!dms.find(ch => ch._id === response.data._id)) {
                setDms([...dms, response.data]);
                socket?.emit("dm_create", friend, response.data);
            }
            
            router.push(`/channels/@me/${response.data._id}`, `/channels/@me/${response.data._id}`, { shallow: true });
        }
    }

    useEffect(() => {
        setWarning("");
        setContent("");
    }, [friendBar])

    switch(friendBar) {
        case "online":
            return (
                <div className={style.container}>
                    <div className={style.friends}>
                        {
                            friends.filter(f => f.status === "online").map((friend: member, i: number) => {
                                return (
                                    <div key={i} className={style.friend}>
                                        <div className={style.pic}>
                                            <Image className={style.avatar} src={friend.avatar} alt={friend.username} width={32} height={32} />
                                            <div className={style.status} style={friend.status === "online" ? { backgroundColor: "var(--green)" } : {}}>
                                                <div className={style.inner} style={friend.status === "online" ? { backgroundColor: "var(--green)" } : {}}></div>
                                            </div>
                                        </div>
                                            
                                        <div className={style.username}>
                                            {friend.username}
                                        </div>

                                        <div className={style.buttons}>
                                            <div onClick={() => openDM([user?._id!, friend._id])}>
                                                <BiMessage size={22} />
                                                <span>Zpráva</span>
                                            </div>

                                            <div onClick={() => handleRemove(user?._id!, friend._id)}>
                                                <MdClose className={style.cross} size={22} />
                                                <span>Odebrat</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )
        case "friends":
            return (
                <div className={style.container}>
                    <div className={style.friends}>
                        {
                            friends.map((friend: member, i: number) => {
                                return (
                                    <div key={i} className={style.friend}>
                                        <div className={style.pic}>
                                            <Image className={style.avatar} src={friend.avatar} alt={friend.username} width={32} height={32} />
                                            <div className={style.status} style={friend.status === "online" ? { backgroundColor: "var(--green)" } : {}}>
                                                <div className={style.inner} style={friend.status === "online" ? { backgroundColor: "var(--green)" } : {}}></div>
                                            </div>
                                        </div>
                                            
                                        <div className={style.username}>
                                            {friend.username}
                                        </div>

                                        <div className={style.buttons}>
                                            <div onClick={() => openDM([user?._id!, friend._id])}>
                                                <BiMessage size={22} />
                                                <span>Zpráva</span>
                                            </div>

                                            <div onClick={() => handleRemove(user?._id!, friend._id)}>
                                                <MdClose className={style.cross} size={22} />
                                                <span>Odebrat</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            )
        case "req":
            return (
                <div className={style.container}>
                    <div className={style.friends}>
                        {friendReqs.map((req: req, i: number) => (
                            <div key={i} className={style.friend}>
                                <Image className={style.avatar} src={req.friend.avatar} alt={req.friend.username} width={36} height={36} />

                                <div className={style.username}>
                                    {req.friend.username}
                                </div>

                                <div className={style.type}>
                                    {req.type === "in" ? "Příchozí žádost" : "Odchozí žádost"}
                                </div>

                                <div className={style.buttons}>
                                    {
                                        req.type === "in" && (
                                             <div>
                                                <MdDone onClick={() => handleAccept(user?._id!, req.friend._id)} size={22} />
                                                <span>Potvrdit</span>
                                            </div>
                                        )
                                    }

                                    <div onClick={() => handleCancel(user?._id!, req.friend._id)}>
                                        <MdClose className={style.cross} size={22} />
                                        <span>Zrušit</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        case "add":
            return (
                <div className={style.container}>
                    <div className={style.add}>
                        <span className={style.text}>Přidat přítele</span>
                        <form action="" onSubmit={handleSubmit} >
                            <input type="text" placeholder="Zadej uživatelské jméno#0000" onChange={handleChange} defaultValue={content} />
                            <button disabled={content.length < 1} type="submit">Odeslat žádost o přátelství</button>
                        </form>
                        <span className={style.warning} ref={warnRef} >{warning}</span>
                    </div>
                </div>
            )
    }

    return <div></div>
}

MainPage.getLayout = function (page: ReactElement) {
    return <MainLayout>{page}</MainLayout>
}

export default MainPage;