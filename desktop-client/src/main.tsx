import ReactDOM from 'react-dom/client';
import './styles/index.css';

import {
    BrowserRouter,
    Routes,
    Route,
    useParams,
    useNavigate,
    Outlet,
} from "react-router-dom";

import HomePage from '@kratercord/common/components/home/FriendContent';
import GuildSidebar from '@kratercord/common/components/layouts/main/GuildSidebar';
import FriendSidebar from '@kratercord/common/components/layouts/home/FriendSidebar';
import ChannelSidebar from '@kratercord/common/components/layouts/channel/ChannelSidebar';
import Channel from '@kratercord/common/components/Channel';
import FetchPage from './pages/FetchPage';
import { QueryClient, QueryClientProvider } from 'react-query';
import SplashScreen from './pages/Splashscreen';
import TitleBar from './components/TitleBar';
import Login from './pages/Login';
import NoAccess from './pages/NoAccess';
import Img from 'react-cool-img';
import { FC } from 'react';
import { setApiUrl } from '@kratercord/common/api';
import { invoke } from '@tauri-apps/api';
import { useSettings } from '@kratercord/common/store/settings';

const root = ReactDOM.createRoot(document.getElementById('root')!)

export const queryClient = new QueryClient();

document.onkeydown = (e) => {
    if (e.key === "F5") {
        e.preventDefault();
        return false;
    }
}

document.oncontextmenu = (_e) => false;

const GuildSidebarWrapper: FC = () => {
    const navigate = useNavigate();
    const params = useParams();

    return <GuildSidebar children={<Outlet />} Image={Img} navigate={navigate} params={params} />
}

const FriendSidebarWrapper: FC = () => {
    const navigate = useNavigate();
    const params = useParams();

    return <FriendSidebar children={<Outlet />} Image={Img} navigate={navigate} params={params} />
}

const ChannelSidebarWrapper: FC = () => {
    const navigate = useNavigate();
    const params = useParams();

    return <ChannelSidebar children={<Outlet />} Image={Img} navigate={navigate} params={params} />
}

const ChannelWrapper: FC<{ dm?: boolean }> = ({ dm }) => {
    const navigate = useNavigate();
    const params = useParams();

    return <Channel dm={dm} Image={Img} navigate={navigate} params={params} />
}

const HomePageWrapper: FC = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-700 h-full w-[calc(100vw_-_300px)] mt-12">
            <HomePage Image={Img} navigate={navigate} />
        </div>
    )
}

const setVoiceSocketURL = useSettings.getState().setVoiceSocketURL;

invoke("get_api_url").then(url => setApiUrl(url as string));
invoke("get_voice_url").then(url => setVoiceSocketURL(url as string));

root.render(
    <div className="w-screen h-screen bg-gray-900">
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path='/splashscreen' element={<SplashScreen />} />

                    <Route path="/" element={<TitleBar />}>
                        <Route index element={<Login />} />

                        <Route path='noaccess' element={<NoAccess />} />

                        <Route path="app" element={<FetchPage />} />

                        <Route path="channels" element={<GuildSidebarWrapper />} >
                            <Route path="@me" element={<FriendSidebarWrapper />} >
                                <Route index element={<HomePageWrapper />} />
                                <Route path=":channelId" element={<ChannelWrapper dm={true} />} />
                            </Route>

                            <Route path=":guildId">
                                <Route path=":channelId" element={<ChannelSidebarWrapper />} >
                                    <Route index element={<ChannelWrapper />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    </div>
)
