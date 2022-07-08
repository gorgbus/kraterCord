import { FC } from "react";
import Img from "react-cool-img";
import { Link, Outlet } from "react-router-dom";
import { useChannel } from "../../store/channel";
import { useGuild } from "../../store/guild";
import { useNotification } from "../../store/notification";
import { useUser } from "../../store/user";
import Sockets from "../Sockets";

const GuildSidebar: FC = () => {
    const { guilds, setGuild, guild } = useGuild();
    const setChannel = useChannel(state => state.setChannel);
    const channels = useChannel(state => state.channels);
    const notifications = useNotification(state => state.notifications);
    const user = useUser(state => state.user);
    const users = useUser(state => state.users);

    return (
        <div className="inline-flex w-full h-full overflow-hidden">
            <Sockets />

            <div className="flex flex-col items-center w-20 h-full bg-gray-900">
                <Link onClick={() => {
                    setChannel('none');
                    setGuild({
                        name: "none",
                        _id: "none",
                        avatar: "none",
                        firstChannel: "none",
                    });
                }} to="/channels/@me" className={`transition-all m-1 relative cursor-pointer rounded-[50%] group duration-300 h-14 w-14 hover:bg-blue-500 hover:rounded-2xl ${guild._id === 'none' ? `rounded-2xl bg-blue-500` : `bg-slate-800`}`} >
                    <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-0 group-hover:scale-100 w-7 top-1/2 ${guild._id === 'none' ? `scale-100 h-10` : `h-6`}`}></span>
                </Link>

                {
                    notifications.filter(n => n.guild === 'none').map((n, i) => {
                        const channel = channels.find(ch => ch._id === n.channel);
                        const friendId = channel?.users?.find(u => u !== user._id);
                        const friend = users.find(u => u._id === friendId);

                        return (
                            <Link key={i} onClick={() => {
                                setChannel(n.channel);
                                setGuild({
                                    name: "none",
                                    _id: "none",
                                    avatar: "none",
                                    firstChannel: "none",
                                });
                            }} className={`relative w-14 h-14 m-1 group`} to={`/channels/@me/${n.channel}`}>
                                <Img className={`mb-2 transition-all duration-300 rounded-[50%] hover:rounded-2xl h-14 w-14`} src={friend?.avatar} />
                                <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-100 group-hover:h-6 w-7 top-1/2 h-2`}></span>
                                
                                <span className="absolute right-0 flex items-center justify-center w-6 h-6 text-xs font-semibold text-gray-100 bg-red-600 border-4 border-gray-900 rounded-full -bottom-1">{n.count}</span>
                            </Link>
                        )
                    })
                }

                <div className="bg-gray-700 m-1 w-8 h-[0.1rem]"></div>
                {
                    guilds.map((gl, i) => {
                        const notification = notifications.find(n => n.guild === gl._id);

                        return (
                            <Link className="relative m-1 w-14 h-14 group" key={i} onClick={() => {
                                setGuild(gl)
                                setChannel(gl.firstChannel)
                            }} to={`/channels/${gl._id}/${gl.firstChannel}`} >
                                <Img className={`mb-2 transition-all duration-300 rounded-[50%] hover:rounded-2xl h-14 w-14 ${guild._id === gl._id && `rounded-2xl`}`} src={gl.avatar} />
                                <span className={`absolute transition-all duration-300 -translate-y-1/2 bg-white rounded-lg -left-[34px] scale-0 group-hover:scale-100 w-7 top-1/2 ${guild._id === gl._id ? `scale-100 h-10` : notification ? `scale-100 h-2 group-hover:h-6` : `h-6`} `}></span>
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