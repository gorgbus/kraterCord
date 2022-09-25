import ReactDOM from 'react-dom/client';
import './styles/index.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import HomePage from './pages/home/@me';
import GuildSidebar from './components/layouts/main/GuildSidebar';
import FriendSidebar from './components/layouts/home/FriendSidebar';
import ChannelSidebar from './components/layouts/channel/ChannelSidebar';
import Channel from './pages/channel/Channel';
import FetchPage from './pages/FetchPage';
import { QueryClient, QueryClientProvider } from 'react-query';
import SplashScreen from './pages/Splashscreen';
import TitleBar from './components/layouts/main/TitleBar';
import Login from './pages/Login';
import NoAccess from './pages/NoAccess';

const root = ReactDOM.createRoot(document.getElementById('root')!)

export const queryClient = new QueryClient();

document.onkeydown = (e) => {
    if (e.key === "F5") {
        e.preventDefault();
        return false;
    }
}

document.oncontextmenu = (_e) => false;

root.render(
    <div className="w-screen bg-gray-900">
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path='/splashscreen' element={<SplashScreen />} />

                    <Route path="/" element={<TitleBar />}>
                        <Route index element={<Login />} />

                        <Route path='noaccess' element={<NoAccess />} />

                        <Route path="app" element={<FetchPage />} />

                        <Route path="channels" element={<GuildSidebar />} >
                            <Route path="@me" element={<FriendSidebar />} >
                                <Route index element={<HomePage />} />
                                <Route path=":channelId" element={<Channel dm={true} />} />
                            </Route>
                            
                            <Route path=":guildId">
                                <Route path=":channelId" element={<ChannelSidebar />} >
                                    <Route index element={<Channel />} />
                                </Route>
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    </div>
    
)
