import type { GetServerSidePropsContext, NextPage } from 'next'
import { useRouter } from 'next/router'
import { API_URl } from '../utils/constants';
import style from "./../styles/login.module.scss";
import { validateCookies } from "./../utils/helpers";

const Home: NextPage = () => {
    const router = useRouter();

    return (
        <div className={style.container}>
            <button onClick={() => router.push(`${API_URl}/auth/discord`)}>Přihlásit se</button>
        </div>
    )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
    const headers = validateCookies(ctx);

    if (headers) return { redirect: { destination: "/channels/@me" } };

    return { props: {} }
}

export default Home;
