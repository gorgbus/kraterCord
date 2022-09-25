import '../styles/index.css'
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppPropsWithLayout } from '../utils/types';
import GuildSidebar from '../components/layouts/main/GuildSidebar';

export const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page);
    const getSidebar = Component.app ? <GuildSidebar>{getLayout(<Component {...pageProps} />)}</GuildSidebar> : getLayout(<Component {...pageProps} />);

    return (
        <QueryClientProvider client={queryClient}>
            <div className='w-screen h-screen bg-gray-900'>
                {getSidebar}
            </div>
        </QueryClientProvider>
    )
}

export default MyApp
