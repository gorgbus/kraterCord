import Image from "next/future/image";
import { useRouter } from "next/router";
import { FC } from "react";

const NavBar: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
    const router = useRouter();

    const login = () => {
        const url = new URL(window.location.href);
        const redir = `${url.protocol}//${url.host}/`;

        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/discord?redir=${redir}`;
    }

    return (
        <div className="fixed z-50 w-[60rem] -translate-x-1/2 top-5 left-1/2">
            <ul className="font-semibold">
                <li onClick={() => router.push("/")} className="flex items-center float-left text-xl cursor-pointer drop-shadow-md">
                    <Image className="mr-2 rounded-md shadow-md" width={48} height={48} src="/images/kratercord.png" alt="kratercord-logo" />

                    <span className="mb-2">kraterCord</span>
                </li>

                <li onClick={loggedIn ? () => router.push("/app") : login} className="float-right h-12 p-3 ml-8 text-gray-900 bg-white cursor-pointer rounded-3xl drop-shadow-md hover:text-orange-500">
                    {loggedIn ? "Otevřít kraterCord" : "Přihlásit se"}
                </li>

                <li onClick={() => router.push("/download")} className="float-right h-12 p-3 cursor-pointer drop-shadow-md hover:underline">
                    Stažení
                </li>
            </ul>
        </div>
    )
}

export default NavBar;