import { LinuxIcon, WindowsIcon } from "@kratercord/common/components/Icons";
import { GetServerSidePropsContext, NextPage } from "next";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

const Download: NextPage<{ loggedIn: boolean }> = ({ loggedIn }) => {
    const downloadString = `https://github.com/gorgbus/kratercord/releases/download/v${process.env.NEXT_PUBLIC_VERSION}/kratercord_${process.env.NEXT_PUBLIC_VERSION}_`

    return (
        <div className="w-full h-full overflow-x-hidden text-gray-100 bg-white">
            <NavBar loggedIn={loggedIn} />

            <div className="w-full h-[32rem] bg-orange-500 overflow-hidden">
                <video autoPlay muted loop className="object-fill min-w-full min-h-full">
                    <source src="/videos/krater.mp4" type="video/mp4" />
                </video>
            </div>

            <main className="flex items-center justify-center w-full h-[30rem]">
                <div className="w-[60rem]">
                    <h1 className="mb-4 text-2xl font-bold text-orange-500 uppercase">Stažení</h1>

                    <div className="flex justify-between w-full h-[25rem]">
                        <div className="w-[49%] h-full bg-gray-100 rounded-md flex flex-col items-center justify-center">
                            <WindowsIcon color="text-gray-800" size="128" />

                            <a href={`${downloadString}x64_en-US.msi`} download className="p-3 w-[8rem] text-lg text-center font-semibold mt-4 text-gray-100 bg-gray-800 rounded-3xl">Stáhnout</a>
                        </div>

                        <div className="w-[49%] h-full bg-gray-100 rounded-md flex flex-col items-center justify-center">
                            <LinuxIcon color="text-gray-800" size="128" />

                            <a href={`${downloadString}amd64.AppImage`} download className="p-3 w-[8rem] text-lg text-center font-semibold mt-4 text-gray-100 bg-gray-800 rounded-3xl">Stáhnout</a>
                        </div>
                    </div>
                </div>
            </main>

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