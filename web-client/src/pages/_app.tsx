import '../styles/index.css'
import { QueryClient, QueryClientProvider } from 'react-query';
import { AppPropsWithLayout } from '../utils/types';
import GuildSidebar from '@kratercord/common/components/layouts/main/GuildSidebar';
import Head from 'next/head';
import Image from 'next/future/image';
import { useRouter } from 'next/router';
import { setApiUrl } from '@kratercord/common/api';

export const queryClient = new QueryClient();

setApiUrl(process.env.NEXT_PUBLIC_API_URL!);

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
    const router = useRouter();
    const navigate = (url: string) => router.push(url);

    const getLayout = Component.getLayout ?? ((page) => page);
    const getSidebar = Component.app ? <GuildSidebar web={true} navigate={navigate} params={router.query} Image={Image} children={getLayout(<Component {...pageProps} />)} /> : getLayout(<Component {...pageProps} />);

    return (
        <QueryClientProvider client={queryClient}>
            <Head>
                <title>kraterCord</title>
            </Head>

            <div className='w-screen h-screen bg-gray-900'>
                {getSidebar}
            </div>
        </QueryClientProvider>
    )
}

export default MyApp
