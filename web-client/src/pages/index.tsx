import type { GetServerSidePropsContext, NextPage } from 'next';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

const Home: NextPage<{ loggedIn: boolean; }> = ({ loggedIn }) => {
    return (
        <div className="w-full h-full overflow-x-hidden text-gray-100 bg-white">
            <NavBar loggedIn={loggedIn} />

            <div className="w-full h-[32rem] bg-orange-500 overflow-hidden">
                <video autoPlay muted loop className="object-fill min-w-full min-h-full">
                    <source src="/videos/krater.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="flex flex-col items-center justify-center h-[20rem] ">
                <div className="w-2/5">
                    <h2 className="text-2xl font-bold text-orange-500 uppercase">кратер</h2>

                    <p className="max-w-[40ch] text-gray-900 font-semibold text-xl">
                        Они держали в страхе казань 4 года устраивали перестрелки с милиции подкупали местную власть имели своих людей в больницах и военкоматах
                    </p>
                </div>
            </div>

            <Footer loggedIn={loggedIn} />
        </div>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const JWT = ctx.req.cookies["JWT"];

    return {
        props: {
            loggedIn: JWT ? true : false
        }
    }
}

export default Home;
