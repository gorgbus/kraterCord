import { ReactElement } from "react";
import Sidebar from "../Sidebar";
import ChatSidebar from "./chatSidebar";
import FriendBar from "./friendBar";

export function MainLayout({ children }: { children: ReactElement }) {
    return (
        <>
            <Sidebar />
            <ChatSidebar />
            <FriendBar />
            <>{children}</>
        </>
    )
}