import { GetServerSidePropsContext, NextPage } from "next";
import Footer from "../components/ui/Footer";
import NavBar from "../components/ui/NavBar";

const Download: NextPage<{ loggedIn: boolean }> = ({ loggedIn }) => {
    return (
        <div className="w-full h-full overflow-x-hidden text-gray-100 bg-white">
            <NavBar loggedIn={loggedIn} />

            <div className="w-full h-[32rem] bg-orange-500 overflow-hidden">
                <video autoPlay muted loop className="object-fill min-w-full min-h-full">
                    <source src="/videos/krater.mp4" type="video/mp4"/>
                </video>
            </div>

            <div>
                
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

export default Download;