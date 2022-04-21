import { FC, useContext } from "react";
import { MdEmojiPeople } from "react-icons/md";
import { HiOutlinePlusSm } from "react-icons/hi";
import style from "./mainLayout.module.scss";
import Image from "next/image";
import { UserContext } from "../../utils/contexts/UserContext";
import { channel } from "../../utils/types";
import { useRouter } from "next/router";
import { ChannelContext } from "../../utils/contexts/ChannelContext";

const ChatSidebar: FC = () => {
    const { setChannel } = useContext(ChannelContext);
    const { user, dms } = useContext(UserContext);

    const router = useRouter();

    const handleRedir = (channel: channel) => {
        setChannel(channel);

        router.push(`/channels/@me/[id]`, `/channels/@me/${channel._id}`, { shallow: true });
    }

    return (
        <div className={style.chat_sidebar}>
            <div className={style.input}>
                <input type="text" placeholder="Najít nebo začít konverzaci" />
            </div>

            <div className={style.chat_list}>
                <div className={style.friends} onClick={() => router.push("/channels/@me", "/channels/@me", { shallow: true })} >
                    <div className={style.icon}>
                        <MdEmojiPeople size={48}/>
                    </div>
                    
                    <span>Přátelé</span>
                </div>

                <div className={style.chats}>
                    <div className={style.text}>
                        <span>Přímé zprávy</span>
                        <HiOutlinePlusSm size={24}/>
                    </div>

                    {dms.map((dm: channel, i: number) => (
                        <div key={i} className={style.chat} onClick={() => handleRedir(dm)} >
                            <Image className={style.avatar} src={dm.users[0]._id === user?._id ? dm.users[1].avatar : dm.users[0].avatar} alt={dm.users[0]._id === user?._id ? dm.users[1].username : dm.users[0].username} width={36} height={36} />

                            <div className={style.username}>
                                {dm.users[0]._id === user?._id ? dm.users[1].username : dm.users[0].username}
                            </div>
                            
                        </div>
                    ))}
                </div>
            </div>

            <div className={style.user_profile}>
                <div className={style.profile}>
                    {
                        user?.avatar && (
                            <Image className={style.avatar} src={user.avatar} height={28} width={28} />
                        )
                    }

                    <div className={style.username}>
                        {user?.username}
                    </div>

                    <div className={style.hash}>
                        #{user?.discordId.slice(user?.discordId.length - 4, user?.discordId.length)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatSidebar;