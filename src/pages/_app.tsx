import Head from 'next/head';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Socket } from 'socket.io-client';
import '../styles/globals.scss'
import { ChannelContext } from '../utils/contexts/ChannelContext';
import { UserContext } from '../utils/contexts/UserContext';
import { AppPropsWithLayout, channel, guild, member, notif, req } from "./../utils/types";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppPropsWithLayout<any>) {
    const [channels, setChannels] = useState<channel[]>();
    const [channel, setChannel] = useState<channel>();
    const [socket, setSocket] = useState<Socket>();
    const [user, setUser] = useState<member>();
    const [users, setUsers] = useState<member[]>([]);
    const [friends, setFriends] = useState<member[]>([]);
    const [friendBar, setFriendBar] = useState<string>("friends");
    const [friendReqs, setFriendReqs] = useState<req[]>([]);
    const [dms, setDms] = useState<channel[]>([]);
    const [scroll, setScroll] = useState<boolean[]>([false, false]);
    const [guilds, setGuilds] = useState<guild[]>();
    const [channelType, setChannelType] = useState<string>("dm");
    const [notifs, setNotifs] = useState<notif[]>([]);

    const getLayout = Component.getLayout ?? ((page) => page);

    const icon = notifs.length != 0 ? `krater-oznameni.ico` : `favicon.ico`;

    return (
        <UserContext.Provider value={{ user, setUser, friends, setFriends, friendBar, setFriendBar, friendReqs, setFriendReqs, dms, setDms, notifs, setNotifs, users, setUsers }}>
            <ChannelContext.Provider value={{ channels, setChannels, channel, setChannel, socket, setSocket, scroll, setScroll, guilds, setGuilds, channelType, setChannelType }}>
                <QueryClientProvider client={queryClient}>
                    <Head>
                        <title>кратерCord</title>
                        {notifs.length === 0 ? <></> : <link rel="icon" type="image/x-icon" href="/krater-oznameni.ico" />}
                        <meta property="og:title" content="кратерCord" />
                        <meta property="og:type" content="website" />
                        <meta property="og:url" content="https://krater-cord.tech/" />
                        <meta property="og:image" content="https://cdn.discordapp.com/attachments/820057517437485106/954397959863291924/WNkk.png" />
                        <meta property="og:description" content="кратерCord" />
                        <meta name="theme-color" content="#41b00e"></meta>
                    </Head>
                    {getLayout(<Component {...pageProps} />)}
                </QueryClientProvider>
            </ChannelContext.Provider>
        </UserContext.Provider>
    )
}

export default MyApp
