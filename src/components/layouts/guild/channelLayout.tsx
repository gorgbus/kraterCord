import { ReactElement, useContext, useEffect } from "react";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";
import GuildSidebar from "./GuildSidebar";
import ChatInput from "./ChatInput";
import MemberSidebar from "./MemberSidebar";
import Sidebar from "../../Sidebar";
import ChatSidebar from "../chatSidebar";
import ChannelHead from "./ChannelHead";

export function ChannelLayout({ children }: { children: ReactElement }) {
    const { channelType } = useContext(ChannelContext);

    return (
        <>
            <Sidebar />
            {channelType === "dm" ? <ChatSidebar /> : <GuildSidebar />}
            <ChannelHead />
            <ChatInput />
            {channelType != "dm" && <MemberSidebar />}
            <>{children}</>
        </>
    )
}