import { FC, useEffect } from "react";
import Img from "react-cool-img";
import { Link, Outlet } from "react-router-dom";
import { useChannel } from "../../store/channel";
import { useFriend } from "../../store/friend";
import { useGuild } from "../../store/guild";
import { useSocket } from "../../store/socket";
import { updateFriends } from "../../utils";

const GuildSidebar: FC = () => {
    const { guilds, setGuild, guild } = useGuild();
    const setChannel = useChannel(state => state.setChannel);
    const { socket } = useSocket();

    const friendState = useFriend();

    useEffect(() => {
        socket?.on('friend-client', (type: string, id: string) => {
            updateFriends(type, id, friendState);
        });
    }, []);

    return (
        <div className="inline-flex w-full h-full overflow-hidden">
            <div className="flex flex-col items-center w-20 h-full bg-gray-900">
                <Link onClick={() => {
                    setChannel('none')
                    setGuild({
                        name: "none",
                        _id: "none",
                        avatar: "none",
                        firstChannel: "none",
                    })
                }} to="/channels/@me" className={`transition-all relative cursor-pointer rounded-[50%] group duration-300 h-14 w-14 hover:bg-blue-500 hover:rounded-2xl ${guild._id === 'none' ? `rounded-2xl bg-blue-500` : `bg-slate-800`}`} >
                    <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-0 group-hover:scale-100 w-7 top-1/2 ${guild._id === 'none' ? `scale-100 h-10` : `h-6`}`}></span>
                </Link>

                <div className="bg-gray-700 m-2 w-8 h-[0.1rem]"></div>

                {
                    guilds.map((gl, i) => {
                        return (
                            <Link className="relative w-14 h-14 group" key={i} onClick={() => {
                                setGuild(gl)
                                setChannel(gl.firstChannel)
                            }} to={`/channels/${gl._id}/${gl.firstChannel}`} >
                                <Img className={`mb-2 transition-all duration-300 rounded-[50%] hover:rounded-2xl h-14 w-14 ${guild._id === gl._id && `rounded-2xl`}`} src={gl.avatar} />
                                <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-0 group-hover:scale-100 w-7 top-1/2 ${guild._id === gl._id ? `scale-100 h-10` : `h-6`}`}></span>
                            </Link>
                        )
                    })
                }
            </div>

            <Outlet />
        </div>
    )
}

export default GuildSidebar;