import '../styles/index.css'
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'
import { AppPropsWithLayout } from '../utils/types';
import GuildSidebar from '../components/layouts/main/GuildSidebar';
import Head from 'next/head';

export const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
    const getLayout = Component.getLayout ?? ((page) => page);
    const getSidebar = Component.app ? <GuildSidebar>{getLayout(<Component {...pageProps} />)}</GuildSidebar> : getLayout(<Component {...pageProps} />);

    return (
        <QueryClientProvider client={queryClient}>
            <Head>
                <title>kraterCord</title>
            </Head>

            <div className='w-screen h-screen bg-gray-900'>
                {getSidebar}
            </div>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    )
}

export default MyApp
