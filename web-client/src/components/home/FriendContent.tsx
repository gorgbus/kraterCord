import Image from "next/future/image";
import { useRouter } from "next/router";
import { FC, Fragment, ReactElement, useState, MouseEvent } from "react";
import { AcceptIcon, CloseIcon, MessageIcon } from "../ui/Icons";
import { useSettings } from "@kratercord/common/store/settings";
import { useSocket } from "@kratercord/common/store/socket";
import { useUserStore } from "@kratercord/common/store/user";
import { FriendsRequest, User } from "@kratercord/common/types";
import { acceptFriend, createChannel, declineFriend, removeFriendApi, sendFriendRequest } from "@kratercord/common/api";

const FriendContent: FC = () => {
    const page = useSettings(state => state.page);

    type Options = {
        [key: string]: ReactElement;
    }

    const options: Options = {
        "Online": <Friends online={true} />,
        "Vše": <Friends />,
        "Nevyřízeno": <Reqs />,
        "add": <AddFriend />
    }

    return options[page];
}

const AddFriend: FC = () => {
    const [content, setContent] = useState("");
    const [msg, setMsg] = useState<string[]>([]);

    const userId = useUserStore(state => state.user.id);
    const addRequest = useUserStore(state => state.addRequest);
    const removeRequest = useUserStore(state => state.removeRequest);
    const addFriend = useUserStore(state => state.addFriend);
    const { socket } = useSocket();

    const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const hash = content.slice(content.length - 4, content.length);
        const username = content.slice(0, content.length - 5);

        setContent("");
        
        const res = await sendFriendRequest(userId, username, hash);

        if (!res) return setMsg(["Něco se nepovedlo", '500']);

        if (res.msg === "Added as friend") {
            addFriend(res.friend!);
            removeRequest(res.requestId!);

            socket?.emit("friend", "add", res.friend?.id, {
                user: res.user,
                requestId: res.requestId
            });

            return setMsg([`${res.friend?.username} byl přidán to tvého seznamu přátel`, '200']);
        }

        addRequest(res.request);

        socket?.emit("friend", "request", res.request.userId, res.request);

        setMsg([`Byla poslána žádost o přátelství uživateli ${res.request.user.username}`, '200']);
    }

    return (
        <div>
            <h2 className="m-4 font-bold text-gray-100 uppercase">Přidat přítele</h2>

            <form className="flex items-center justify-between m-4 rounded p-2 bg-gray-900 w-[100%_-_16px]">
                <input className="bg-transparent border-none outline-0 w-96 text-gray-50 placeholder:text-gray-700 placeholder:text-sm" value={content} maxLength={32} onChange={(e) => setContent(e.target.value)} placeholder="Zadej uživatelské jméno#0000" />

                <button onClick={(e) => onSubmit(e)} type="submit" disabled={content.length < 1} className="p-1 pl-3 pr-3 text-xs font-bold bg-blue-600 rounded text-gray-50 disabled:opacity-40">
                    Odeslat žádost o přátelství
                </button>
            </form>

            <p className={`${msg[1] === '500' ? `text-red-800` : `text-green-500`} ml-4 font-bold text-sm`}>{msg[0]}</p>
        </div>
    )
}

const UserComponent: FC<{ friend: User; req?: FriendsRequest; reqType?: string; }> = ({ friend, req, reqType }) => {
    const userId = useUserStore(state => state.user.id);
    const dms = useUserStore(state => state.user.dms);
    const addDM = useUserStore(state => state.addDM);
    const addFriend = useUserStore(state => state.addFriend);
    const removeRequest = useUserStore(state => state.removeRequest);
    const removeFriend = useUserStore(state => state.removeFriend);
    const socket = useSocket(state => state.socket);

    const router = useRouter();

    const decline = async () => {
        const requestId = await declineFriend(req?.id!);
        const friendId = req?.requesterId !== userId ? req?.requesterId : req?.userId;

        if (requestId) {
            removeRequest(requestId);

            socket?.emit("friend", "decline", friendId, req?.id);
        }
    }

    const remove = async () => {
        const friendId = await removeFriendApi(userId, friend.id);

        if (friendId) {
            removeFriend(friendId);

            socket?.emit("friend", "remove", friendId, userId);
        }
    } 

    const accept = async () => {
        const res = await acceptFriend(req?.id!, userId, friend.id);

        if (res) {
            const { friend, requestId, user } = res;

            removeRequest(requestId);
            addFriend(friend);

            socket?.emit("friend", "add", friend.id, {
                user,
                requestId
            });
        }
    }

    const openDM = async () => {
        const dm = dms.find(dm => dm.users[0].id === friend.id || dm.users[1].id === friend.id);

        if (dm) return router.push(`/channels/@me/${dm.id}`);

        const newDM = await createChannel([{ id: userId }, { id: friend.id }], 'DM', 'dm channel');

        if (newDM) {
            addDM(newDM);

            router.push(`/channels/@me/${newDM.id}`);
        }
    }

    return (
        <div className="flex items-center justify-between p-2 m-4 border-t-2 border-gray-600 border-solid cursor-pointer hover:rounded-md group hover:bg-gray-600">
            <div className="flex items-center h-8">
                <div className="relative">
                    <Image width={32} height={32} className="rounded-full" src={friend.avatar} alt={friend.username} />
                    {!req && friend.status === 'ONLINE' && <span className="-bottom-[2px] -right-[2px] absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-700 group-hover:dark:border-gray-600 rounded-full"></span>}
                </div>

                <div className="flex flex-col">
                    <div className="inline-flex">
                        <span className="ml-2 text-sm font-bold text-gray-100">{friend.username}</span>
                        <span className="hidden text-sm font-semibold text-gray-400 group-hover:block">#{friend.hash}</span>
                    </div>
                    
                    {req && <p className="ml-2 text-xs font-semibold text-gray-400">{reqType === 'out' ? 'Odchozí žádost o přátelství' : 'Příchozí žádost o přátelství'}</p>}
                    {!req && <p className="ml-2 text-xs font-semibold text-gray-400 lowercase first-letter:uppercase">{friend.status}</p> }
                </div>
            </div>

            <div className="flex">
                {
                    reqType === "in" && <div onClick={accept} className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-100 group-icon">
                        <AcceptIcon size='20' color='text-gray-300 group-icon-hover:text-green-600' />
                    </div>
                }

                {
                    !req && <div onClick={openDM} className="flex items-center justify-center w-8 h-8 mr-2 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-100 group-icon">
                        <MessageIcon size='20' color='text-gray-300 group-icon-hover:text-gray-100' />
                    </div>
                }

                <div onClick={() => req ? decline() : remove()} className="flex items-center justify-center w-8 h-8 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-100 group-icon">
                    <CloseIcon size='20' color='text-gray-300 group-icon-hover:text-red-600' />
                </div>
            </div>
        </div>
    )
}

const Reqs: FC = () => {
    const user = useUserStore(state => state.user);

    const requests = [...user.incomingFriendReqs, ...user.outgoingFriendReqs];

    return (
        <div className="flex flex-col w-full h-full">
            <h3 className={`ml-4 mt-4 uppercase font-semibold text-xs text-gray-400 ${requests.length < 1 && `hidden`}`}>Nevyřízeno - {requests.length}</h3>

            {
                requests.map((request, i) => {
                    const requester = request.userId === user.id ? request.requester : request.user;
                    const type = request.userId === user.id ? "in" : "out";

                    return (
                        <Fragment key={i}>
                            <UserComponent friend={requester} req={request} reqType={type} />
                        </Fragment>
                    )
                })
            }
        </div>
    )
}

const Friends: FC<{ online?: boolean }> = ({ online }) => {
    const friends = useUserStore(state => state.user.friends);

    const filteredFriends = friends.filter(friend => online ? friend.status === 'ONLINE' : friend);

    return (
        <div className="flex flex-col w-full h-full">
            <h3 className={`ml-4 mt-4 uppercase font-semibold text-xs text-gray-400  ${filteredFriends.length < 1 && `hidden`}`}>{online ? 'Online' : 'Všichni přátelé'} - {filteredFriends.length}</h3>

            {
                filteredFriends.map((friend, i) => {
                    return (
                        <Fragment key={i}>
                            <UserComponent friend={friend} />
                        </Fragment>
                    )
                })
            }
        </div>
    )
}

export default FriendContent;