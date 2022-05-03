import { FC, useContext, useState } from "react";
import { MdEmojiPeople } from "react-icons/md";
import { HiOutlinePlusSm } from "react-icons/hi";
import style from "./mainLayout.module.scss";
import Image from "next/image";
import { UserContext } from "../../utils/contexts/UserContext";
import { channel } from "../../utils/types";
import { useRouter } from "next/router";
import { ChannelContext } from "../../utils/contexts/ChannelContext";
import { IoMdSettings } from "react-icons/io";

const ChatSidebar: FC = () => {
    const { setChannel } = useContext(ChannelContext);
    const { user, dms, users, setVisible } = useContext(UserContext);

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

                    {
                        dms.map((dm: channel, i: number) => {
                            const id = dm.users[0]._id === user?._id ? dm.users[1]._id : dm.users[0]._id;
                            const _user = users.find(u => u._id === id);

                            return (
                                <div key={i} className={style.chat} onClick={() => handleRedir(dm)} >
                                    <div className={style.pic}>
                                        <Image className={style.avatar} src={_user?.avatar!} alt={_user?.username} width={36} height={36} />
                                        <div className={style.status} style={_user?.status === "online" ? { backgroundColor: "var(--green)" } : {}}>
                                            <div className={style.inner} style={_user?.status === "online" ? { backgroundColor: "var(--green)" } : {}}></div>
                                        </div>
                                    </div>
                                    

                                    <div className={style.username}>
                                        {_user?.username}
                                    </div>
                                    
                                </div>
                            )
                        })
                    }
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

                <IoMdSettings size={20} className={style.settings} onClick={() => setVisible(true)} />
            </div>
        </div>
    )
}

export default ChatSidebar;