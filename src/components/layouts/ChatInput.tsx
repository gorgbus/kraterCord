import { FC, MouseEvent, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useChannel } from "../../store/channel";
import { useGuild } from "../../store/guild";
import { useSocket } from "../../store/socket";
import { useUser } from "../../store/user";
import { addMessage } from "../../utils";
import { createMessage } from "../../utils/api";
import { infQuery } from "../../utils/types";

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
        onMutate: async ({ msg }) => {
            await queryClient.cancelQueries(['channel', channel]);

            const cache = queryClient.getQueryData<infQuery>(["channel", channel]);
            const newCache = addMessage(msg, cache);

            const message = {
                id: channel,
                msg,
                guild: guild._id
            }

            queryClient.setQueryData(["channel", channel], newCache);

            if (dm?.type === 'dm') socket?.emit('create_message_dm', friendId, message); else socket?.emit("create_message", message);

            return {
                cache,
            }
        },
        onError: (_error, _data, context) => {
            queryClient.setQueryData(['channel', channel], context?.cache);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['channel', channel]);
        }
    })

    const sendMessage = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (content.length < 1) return;

        const msg = {
            content,
            author: user,
            channel,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now()),
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