import { FC, MouseEvent, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useChannel } from "../store/channel";
import { useGuild } from "../store/guild";
import { useSocket } from "../store/socket";
import { useUser } from "../store/user";
import { addMessage } from "../utils";
import { createMessage } from "../utils/api";
import { infQuery } from "../utils/types";

const ChatInput: FC = () => {
    const channel = useChannel(state => state.channel);
    const channels = useChannel(state => state.channels);
    const user = useUser(state => state.user);
    const users = useUser(state => state.users);
    const guild = useGuild(state => state.guild);
    const socket = useSocket(state => state.socket);

    const dm = channels.find(ch => ch._id === channel);

    const friendId = dm?.users?.find(u => u !== user._id);
    const friend = users.find(u => u._id === friendId);

    const [content, setContent] = useState("");
    const queryClient = useQueryClient();

    const { mutate } = useMutation(createMessage, {
        onSuccess: (data) => {
            const cache = queryClient.getQueryData<infQuery>(["channel", channel]);
            const newCache = addMessage(data, cache);

            if (!newCache) return;

            const msg = {
                id: channel,
                msg: data,
                guild: guild._id || null
            }

            queryClient.setQueryData(["channel", channel], newCache);

            if (dm?.type === 'dm') socket?.emit('create_message_dm', friendId, msg); else socket?.emit("create_message", msg);
        }
    })

    const sendMessage = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (content.length < 1) return;

        const msg = {
            content,
            author: user._id,
            channel
        }

        setContent("");

        mutate({
            id: channel,
            msg
        })
    }

    return (
        <div className="flex items-center justify-center w-full h-16 bg-gray-700">
            <div className="flex items-center w-full h-10 m-4 bg-gray-600 rounded-md">
                <form className="w-full">
                    <input className="flex-1 w-full ml-3 text-sm text-gray-100 bg-transparent outline-none" value={content} onChange={(e: any) => setContent(e.target.value)} type="text" placeholder={`Zpráva ${dm?.type === 'dm' ? `@${friend?.username}` : `#${dm?.name}`}`} />
                    <button className="hidden" type="submit" onClick={async (e: MouseEvent<HTMLButtonElement>) => sendMessage(e)}>posrart zpravu</button>
                </form>
            </div>
        </div>
    )
}

export default ChatInput;