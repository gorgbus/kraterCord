import { FC, useContext } from "react";
import style from "./channelLayout.module.scss";
import { BsHash } from "react-icons/bs";
import { MdAlternateEmail } from "react-icons/md";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";
import { UserContext } from "../../../utils/contexts/UserContext";

const ChannelHead:FC = () => {
    const { channel, channelType } = useContext(ChannelContext);
    const { user, users } = useContext(UserContext);

    const id = channel?.users[0] ? channel?.users[0]._id === user?._id ? channel?.users[1]._id : channel?.users[0]._id : channel?.name;
    const _user = users.find(u => u._id === id);

    return (
        <div className={style.channel_head}>
            {channelType === "dm" ? <MdAlternateEmail style={{ marginRight: "5px" }} className={style.icon} size={24} /> : <BsHash className={style.icon} size={28} />}
            
            <span className={style.name}>{channelType === "dm" && channel?.users[0] ? _user?.username : channel?.name}</span>
            {
                channelType === "dm" && 
                    <div className={style.status} style={_user?.status === "online" ? { backgroundColor: "var(--green)" } : {}}>
                        <div className={style.inner} style={_user?.status === "online" ? { backgroundColor: "var(--green)" } : {}}></div>
                    </div>
            }
        </div>
    )
}

export default ChannelHead;