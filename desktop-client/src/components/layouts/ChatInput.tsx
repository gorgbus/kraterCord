import { FC, MouseEvent, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import { useSettings } from "../../store/settings";
import { useSocket } from "../../store/socket";
import { Channel, Message, useUser } from "../../store/user";
import { addMessage } from "../../utils";
import { createMessage } from "../../utils/api";

const ChatInput: FC = () => {
    const { guildId, channelId } = useParams();

    const dms = useUser(state => state.user.dms);
    const userId = useUser(state => state.user.id);
    const avatar = useUser(state => state.user.avatar);
    const username = useUser(state => state.user.username);
    const socket = useSocket(state => state.socket);

    const dm = dms.find(dm => dm.id === channelId);
    const friend = dm?.users[0].id === userId ? dm.users[1] : dm?.users[0]

    const [content, setContent] = useState("");
    const queryClient = useQueryClient();

    const channels = queryClient.getQueryData<Channel[]>(["channels", guildId]);
    const channel = channels?.find(ch => ch.id === channelId);

    const { mutate } = useMutation(createMessage, {
        onMutate: async (msg) => {
            await queryClient.cancelQueries(['channel', channelId]);

            const message = {
                ...msg,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                author: {
                    id: userId,
                    avatar, 
                    username
                }
            }

            const cache = queryClient.getQueryData<{ pages: { messages: Message[]; nextId: string }[]; pageParams: [] }>(["channel", channelId]);
            const newCache = addMessage(message, cache);

            const socketData = {
                id: channelId,
                msg: message,
                guild: guildId
            }

            queryClient.setQueryData(["channel", channelId], newCache);

            if (dm) socket?.emit('create_message_dm', friend?.id, socketData); else socket?.emit("create_message", socketData);

            return {
                cache,
            }
        },
        onError: (_error, _data, context: any) => {
            queryClient.setQueryData(['channel', channelId], context?.cache);
        },
        onSettled: () => {
            queryClient.invalidateQueries(['channel', channelId]);
        }
    })

    const sendMessage = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (content.length < 1) return;

        setContent("");

        mutate({
            authorId: userId,
            channelId: channelId as string,
            content
        })
    }

    return (
        <div className="flex items-center justify-center w-full h-16 bg-gray-700">
            <div className="flex items-center w-full h-10 m-4 bg-gray-600 rounded-md">
                <form className="w-full">
                    <input className="flex-1 w-full ml-3 text-sm text-gray-100 bg-transparent outline-none" value={content} onChange={(e: any) => setContent(e.target.value)} type="text" placeholder={`Zpráva ${dm ? `@${friend?.username}` : `#${channel?.name}`}`} />
                    <button className="hidden" type="submit" onClick={async (e: MouseEvent<HTMLButtonElement>) => sendMessage(e)}>posrart zpravu</button>
                </form>
            </div>
        </div>
    )
}

export default ChatInput;