import { FC, useContext } from "react";
import style from "./channelLayout.module.scss";
import { BsHash } from "react-icons/bs";
import { MdAlternateEmail } from "react-icons/md";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";
import { UserContext } from "../../../utils/contexts/UserContext";

const ChannelHead:FC = () => {
    const { channel, channelType } = useContext(ChannelContext);
    const { user } = useContext(UserContext);

    return (
        <div className={style.channel_head}>
            {channelType === "dm" ? <MdAlternateEmail style={{ marginRight: "5px" }} className={style.icon} size={24} /> : <BsHash className={style.icon} size={28} />}
            
            <span className={style.name}>{channelType === "dm" && channel?.users[0] ? channel?.users[0]._id === user?._id ? channel?.users[1].username : channel?.users[0].username : channel?.name}</span>
        </div>
    )
}

export default ChannelHead;