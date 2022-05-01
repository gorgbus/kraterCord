import Image from "next/image";
import { FC, useContext } from "react";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";
import { UserContext } from "../../../utils/contexts/UserContext";
import style from "./channelLayout.module.scss";

const MemberSidebar: FC = () => {
    const { channelType, channel } = useContext(ChannelContext);
    const { users } = useContext(UserContext);

    return (
        <div className={style.member_sidebar}>
            <span className={style.text}>Online — {users.filter(u => u.status === "online").length}</span>
            <div className={style.online}>
                {
                    channelType === "dm" ?
                        users.filter(u => u._id === channel?.users[0]?._id || u._id === channel?.users[1]?._id).filter(u => u.status === "online").map((u, i) => (
                            <div key={i} className={style.user}>
                                <div className={style.icon}>
                                    <Image className={style.avatar} src={u.avatar} alt={u.username} width={32} height={32} />
                                    <div className={style.status}/>
                                </div>
                                <span className={style.username}>{u.username}</span>
                            </div>
                        ))
                        :
                        users.map((usr, i) => (
                            usr.status === "online" &&
                                (<div key={i} className={style.user}>
                                    <div className={style.icon}>
                                        <Image className={style.avatar} src={usr.avatar} alt={usr.username} width={32} height={32} />
                                        <div className={style.status}/>
                                    </div>
                                    <span className={style.username}>{usr.username}</span>
                                </div>)
                        ))
                }
            </div>

            <span className={style.text}>Offline{users.filter(u => u.status === "offline").length === 0 ? "" : ` — ${users.filter(u => u.status === "offline").length}`}</span>
            <div className={style.offline}>
                {
                    channelType === "dm" ?
                        users.filter(u => u._id === channel?.users[0]?._id || u._id === channel?.users[1]?._id).filter(u => u.status === "offline").map((u, i) => (
                            <div key={i} className={style.user}>
                                <div className={style.icon}>
                                    <Image className={style.avatar} src={u.avatar} alt={u.username} width={32} height={32} />
                                    <div className={style.status}/>
                                </div>
                                <span className={style.username}>{u.username}</span>
                            </div>
                        ))
                        :
                        users.map((usr, i) => (
                            usr.status === "offline" &&
                                (<div key={i} className={style.user}>
                                    <div className={style.icon}>
                                        <Image className={style.avatar} src={usr.avatar} alt={usr.username} width={32} height={32} />
                                        <div className={style.status}/>
                                    </div>
                                    <span className={style.username}>{usr.username}</span>
                                </div>)
                        ))
                }
            </div>
        </div>
    )
}

export default MemberSidebar;