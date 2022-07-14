import { AxiosResponse } from "axios";
import { FC, Fragment, MouseEvent, useState } from "react";
import Img from "react-cool-img";
import { useNavigate } from "react-router-dom";
import { AcceptIcon, CloseIcon, MessageIcon } from "../../components/ui/Icons";
import { useChannel } from "../../store/channel";
import { useFriend } from "../../store/friend";
import { useSocket } from "../../store/socket";
import { user, useUser } from "../../store/user";
import { updateFriends } from "../../utils";
import { createChannel, handleFriend, sendFriendRequest } from "../../utils/api";

const FriendContent: FC = () => {
    const { page } = useFriend(state => state);

    switch(page) {
        case 'Online':
            return <Friends online={true} />
        
        case 'Vše':
            return <Friends />

        case 'Nevyřízeno':
            return <Reqs />
        case 'add':
            return <AddFriend />
    }

    return <div></div>
}

const AddFriend: FC = () => {
    const [content, setContent] = useState("");
    const [msg, setMsg] = useState<string[]>([]);

    const { users, user } = useUser();
    const { friends, reqs, addReq } = useFriend();
    const { socket } = useSocket();

    const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const hash = content.slice(content.length - 4, content.length);
        const username = content.slice(0, content.length - 5);
        const _user = content;

        setContent("");

        const friend = users.find(u => u.username === username && u.hash === hash);

        if (!friend) return setMsg([`Uživatel ${_user} nebyl nalezen`, '500']);

        if (friend._id === user._id) return setMsg(['Nemůžeš přidat sám sebe', '500']);

        if (friends.some(id => id === friend._id)) return setMsg([`${_user} už je tvůj přítel`, '500']);
        if (reqs.some(u => u.friend === friend._id)) return setMsg([`Už jsi poslal žádost o přátelství uživateli ${_user}`, '500']);

        const res = await sendFriendRequest(user._id, username, hash);

        if (res.status) {
            if (res.status === 200) {
                addReq({ friend: res.data.friend._id, type: 'out' })

                socket?.emit('friend', 'req', user._id, friend._id);
            }

            return setMsg([res.data.msg, res.status.toString()]);
        }

        setMsg(['Něco se nepovedlo', '500']);
    }

    return (
        <div>
            <h2 className="m-4 font-bold text-gray-100 uppercase">Přidat přítele</h2>

            <form className="flex items-center justify-between m-4 rounded p-2 bg-gray-900 w-[100%_-_16px]">
                <input className="bg-transparent border-none outline-0 w-96 text-gray-50 placeholder:text-gray-700 placeholder:text-sm" value={content} maxLength={32} onChange={(e) => setContent(e.target.value)} placeholder="Zadej uživatelské jméno#0000" />

                <button onClick={(e: MouseEvent<HTMLButtonElement>) => onSubmit(e)} type="submit" disabled={content.length < 1} className="p-1 pl-3 pr-3 text-xs font-bold bg-blue-600 rounded text-gray-50 disabled:opacity-40">
                    Odeslat žádost o přátelství
                </button>
            </form>

            <p className={`${msg[1] === '500' ? `text-red-800` : `text-green-500`} ml-4 font-bold text-sm`}>{msg[0]}</p>
        </div>
    )
}

const User: FC<{ friend: user; req?: string }> = ({ friend, req }) => {
    const user = useUser(state => state.user);
    const channels = useChannel(state => state.channels);
    const setChannel = useChannel(state => state.setChannel);
    const addChannel = useChannel(state => state.addChannel);
    const { socket } = useSocket();

    const friendState = useFriend();
    const navigate = useNavigate();

    const handleButton = async (type: string) => {
        const res: AxiosResponse = await handleFriend(user._id, friend._id, type);

        if (res && res.status === 200) {
            updateFriends(type, friend._id, friendState);

            socket?.emit('friend', type, user._id, friend._id);
        }
    }

    const openDM = async () => {
        const dm = channels.find((ch => ch.users![0] === friend._id || ch.users![1] === friend._id))

        if (dm) {
            setChannel(dm._id);
            return navigate(dm._id);
        }

        const res: AxiosResponse = await createChannel([user._id, friend._id], 'dm');

        if (res && res.status === 200) {
            setChannel(res.data._id);
            addChannel(res.data);

            navigate(res.data._id);
        }
    }

    return (
        <div className="flex items-center justify-between p-2 m-4 border-t-2 border-gray-600 border-solid cursor-pointer hover:rounded-md group hover:bg-gray-600">
            <div className="flex items-center h-8">
                <div className="relative">
                    <Img className="w-8 h-8 rounded-full" src={friend.avatar} />
                    {!req && friend.status === 'online' && <span className="-bottom-[2px] -right-[2px] absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-700 group-hover:dark:border-gray-600 rounded-full"></span>}
                </div>

                <div className="flex flex-col">
                    <div className="inline-flex">
                        <span className="ml-2 text-sm font-bold text-gray-100">{friend.username}</span>
                        <span className="hidden text-sm font-semibold text-gray-400 group-hover:block">#{friend.hash}</span>
                    </div>
                    
                    {req && <p className="ml-2 text-xs font-semibold text-gray-400">{req === 'out' ? 'Odchozí žádost o přátelství' : 'Příchozí žádost o přátelství'}</p>}
                    {!req && <p className="ml-2 text-xs font-semibold text-gray-400 first-letter:uppercase">{friend.status}</p> }
                </div>
            </div>

            <div className="flex">
                {
                    req === "in" && <div onClick={() => handleButton('accept')} className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-100 group-icon">
                        <AcceptIcon size={'20'} color={`gray-300 group-icon-hover:text-green-600`} />
                    </div>
                }

                {
                    !req && <div onClick={openDM} className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-100 group-icon">
                        <MessageIcon size={'20'} color={`gray-300 group-icon-hover:text-gray-100`} />
                    </div>
                }

                <div onClick={() => req ? handleButton('decline') : handleButton('remove')} className="flex items-center justify-center w-8 h-8 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-100 group-icon">
                    <CloseIcon size={'20'} color={'gray-300 group-icon-hover:text-red-600'} />
                </div>
            </div>
        </div>
    )
}

const Reqs: FC = () => {
    const reqs = useFriend(state => state.reqs);
    const users = useUser(state => state.users);

    return (
        <div className="flex flex-col w-full h-full">
            <h3 className={`ml-4 mt-4 uppercase font-semibold text-xs text-gray-400 ${reqs.length < 1 && `hidden`}`}>Nevyřízeno - {reqs.length}</h3>

            {
                reqs.map((req, i) => {
                    const user = users.find(u => u._id === req.friend);

                    return (
                        <Fragment key={i}>
                            {
                                user && <User friend={user} req={req.type} />
                            }
                        </Fragment>
                    )
                })
            }
        </div>
    )
}

const Friends: FC<{ online?: boolean }> = ({ online }) => {
    const friends = useFriend(state => state.friends);
    const users = useUser(state => state.users);

    const filteredFriends = friends.filter(fr => online ? users.find(u => u._id === fr)?.status === 'online' : fr);

    return (
        <div className="flex flex-col w-full h-full">
            <h3 className={`ml-4 mt-4 uppercase font-semibold text-xs text-gray-400  ${filteredFriends.length < 1 && `hidden`}`}>{online ? 'Online' : 'Všichni přátelé'} - {filteredFriends.length}</h3>

            {
                filteredFriends.map((friend, i) => {
                    const user = users.find(u => u._id === friend);

                    return (
                        <Fragment key={i}>
                            {
                                user && <User friend={user} />
                            }
                        </Fragment>
                    )
                })
            }
        </div>
    )
}

export default FriendContent;