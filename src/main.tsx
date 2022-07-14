import ReactDOM from 'react-dom/client';
import './assets/index.css';

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
import FetchPage from './pages/fetch/FetchPage';
import { QueryClient, QueryClientProvider } from 'react-query';
import SplashScreen from './pages/splashscreen/Splashscreen';
import TitleBar from './components/layouts/main/TitleBar';
import Login from './pages/login/Login';

const root = ReactDOM.createRoot(document.getElementById('root')!)

const queryClient = new QueryClient();

root.render(
    <div className="w-screen bg-gray-900">
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path='/splashscreen' element={<SplashScreen />} />

                    <Route path="/" element={<TitleBar />}>
                        <Route index element={<Login />} />

                        <Route path="app" element={<FetchPage />} />

                        <Route path="channels" element={<GuildSidebar />} >
                            <Route path="@me" element={<FriendSidebar />} >
                                <Route index element={<HomePage />} />
                                <Route path=":channel" element={<Channel dm={true} />} />
                            </Route>
                            
                            <Route path=":guild">
                                <Route path=":channel" element={<ChannelSidebar />} >
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
