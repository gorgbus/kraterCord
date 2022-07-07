import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainPage from './@me';
import GuildSidebar from './components/layouts/GuildSidebar';
import FriendSidebar from './components/layouts/FriendSidebar';
import ChannelSidebar from './components/layouts/ChannelSidebar';
import Channel from './Channel';
import FetchPage from './FetchPage';
import { QueryClient, QueryClientProvider } from 'react-query';
import SplashScreen from './splashscreen';
import TitleBar from './components/layouts/TitleBar';

const root = ReactDOM.createRoot(document.getElementById('root')!)

const queryClient = new QueryClient();

root.render(
    <div className="bg-gray-900">
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path='/splashscreen' element={<SplashScreen />} />

                    <Route path="/" element={<TitleBar />}>
                        <Route index element={<App />} />

                        <Route path="app" element={<FetchPage />} />

                        <Route path="channels" element={<GuildSidebar />} >
                            <Route path="@me" element={<FriendSidebar />} >
                                <Route index element={<MainPage />} />
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
