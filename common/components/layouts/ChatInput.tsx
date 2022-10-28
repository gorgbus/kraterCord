import { FC, MouseEvent, useState } from "react";
import { useQueryClient } from "react-query";
import { useUserStore } from "@kratercord/common/store/user";
import { BaseProps, Channel, Optional } from "@kratercord/common/types";
import { useChannel } from "@kratercord/common/hooks";

const ChatInput: FC<Optional<Optional<BaseProps, "navigate">, "Image">> = ({ params }) => {
    const { guildId, channelId } = params;

    const dms = useUserStore(state => state.user.dms);
    const userId = useUserStore(state => state.user.id);
    const avatar = useUserStore(state => state.user.avatar);
    const username = useUserStore(state => state.user.username);
    const members = useUserStore(state => state.user.members);

    const dm = dms.find(dm => dm.id === channelId);
    const friend = dm?.users[0].id === userId ? dm.users[1] : dm?.users[0]

    const [content, setContent] = useState("");
    const queryClient = useQueryClient();

    const channels = queryClient.getQueryData<Channel[]>(["channels", guildId]);
    const channelName = channels?.find(ch => ch.id === channelId)?.name;
    const member = members.find(member => member.guildId === guildId);

    const { addMessageSender } = useChannel();

    const sendMessage = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (content.length < 1) return;

        setContent("");

        addMessageSender({
            guildId: guildId as string | undefined,
            channelId: channelId as string,
            content,
            member,
            author: {
                username,
                avatar,
                id: userId
            }
        })
    }

    return (
        <div className="flex items-center justify-center w-full h-16 bg-gray-700">
            <div className="flex items-center w-full h-10 m-4 bg-gray-600 rounded-md">
                <form className="w-full">
                    <input className="flex-1 w-full ml-3 text-sm text-gray-100 bg-transparent outline-none" value={content} onChange={(e: any) => setContent(e.target.value)} type="text" placeholder={`Zpráva ${dm ? `@${friend?.username}` : `#${channelName}`}`} />
                    <button className="hidden" type="submit" onClick={async (e: MouseEvent<HTMLButtonElement>) => sendMessage(e)}></button>
                </form>
            </div>
        </div>
    )
}

export default ChatInput;