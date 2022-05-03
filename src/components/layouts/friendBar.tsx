import Image from "next/image";
import { FC, useContext } from "react";
import { MdEmojiPeople } from "react-icons/md";
import { ChannelContext } from "../../utils/contexts/ChannelContext";
import { UserContext } from "../../utils/contexts/UserContext";
import style from "./mainLayout.module.scss";

const FriendBar: FC = () => {
    const { setFriendBar, friendBar } = useContext(UserContext);

    return (
        <div className={style.friend_bar}>
            <div className={style.bar}>
                <div className={style.friends}>
                    <div className={style.icon}>
                        <MdEmojiPeople size={48}/>
                    </div>
                        
                    <span>Přátelé</span>
                </div>

                <div className={style.line}/>

                <button className={`${style.other} ${friendBar === "online" && style.selected}`} onClick={() => setFriendBar("online")}>Online</button>

                <button className={`${style.other} ${friendBar === "friends" && style.selected}`} onClick={() => setFriendBar("friends")}>Vše</button>

                <button className={`${style.other} ${friendBar === "req" && style.selected}`} onClick={() => setFriendBar("req")}>Nevyřízeno</button>

                <button className={style.add} onClick={() => setFriendBar("add")}>Přidat přítele</button>
            </div>
        </div>
    )
}

export default FriendBar;