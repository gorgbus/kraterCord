import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import MainPage from './@me';
import { appWindow } from '@tauri-apps/api/window';
import GuildSidebar from './components/layouts/GuildSidebar';
import FriendSidebar from './components/layouts/FriendSidebar';
import ChannelSidebar from './components/layouts/ChannelSidebar';
import Channel from './Channel';
import FetchPage from './FetchPage';
import { QueryClient, QueryClientProvider } from 'react-query';

const root = ReactDOM.createRoot(document.getElementById('root')!)

const queryClient = new QueryClient();

root.render(
    <div className="bg-gray-900">
        <div data-tauri-drag-region className="h-5 bg-gray-900 select-none fixed top-0 left-0 right-0 flex justify-end">
            <div onClick={() => appWindow.minimize()} className="inline-flex justify-center items-center w-6 h-5 cursor-pointer hover:bg-gray-700" id="titlebar-minimize">
                <img
                src="https://api.iconify.design/mdi:window-minimize.svg?color=%23777"
                alt="minimize"
                />
            </div>

            <div onClick={() => appWindow.toggleMaximize()} className="inline-flex justify-center items-center w-6 h-5 cursor-pointer hover:bg-gray-700" id="titlebar-maximize">
                <img
                src="https://api.iconify.design/mdi:window-maximize.svg?color=%23777"
                alt="maximize"
                />
            </div>

            <div onClick={() => appWindow.hide()} className="inline-flex justify-center items-center w-6 h-5 cursor-pointer hover:bg-red-500" id="titlebar-close">
                <img src="https://api.iconify.design/mdi:close.svg?color=%23777" alt="close" />
            </div>
        </div>

        <div className="h-[calc(100vh_-_20px)] mt-5">
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/">
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
    </div>
    
)
