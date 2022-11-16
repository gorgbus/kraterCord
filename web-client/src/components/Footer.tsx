import Image from "next/future/image";
import { useRouter } from "next/router";
import { FC } from "react";

const Footer: FC<{ loggedIn: boolean }> = ({ loggedIn }) => {
    const router = useRouter();

    const login = () => {
        const url = new URL(window.location.href);
        const redir = `${url.protocol}//${url.host}/`;

        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/discord?redir=${redir}`;
    }

    return (
        <div className="w-full h-56">
            <div className="w-full h-[10rem] bg-gray-800 flex items-center flex-col justify-center">
                <div className="flex items-center justify-between w-[60rem] mb-12">
                    <div onClick={() => router.push("/")} className="flex items-center float-left text-xl font-semibold cursor-pointer drop-shadow-md">
                        <Image className="mr-2 rounded-md shadow-md" width={48} height={48} src="/images/kratercord.png" alt="kratercord-logo" />

                        <span className="mb-2">kraterCord</span>
                    </div>

                    <ul className="mt-4 font-semibold text-orange-500">
                        <li>
                            Produkt

                            <ul className="ml-4 text-gray-300">
                                <li className="transition-all cursor-pointer hover:text-gray-100" onClick={loggedIn ? () => router.push("/app") : login}>
                                    {loggedIn ? "Otevřít kraterCord" : "Přihlásit se"}
                                </li>

                                <li onClick={() => router.push("/download")} className="transition-all cursor-pointer hover:text-gray-100">
                                    Stažení
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="w-full h-[4rem] bg-gray-900 flex items-center flex-col justify-center">
                <span className="w-[60rem] font-semibold text-gray-100">&copy; 2022 kraterCord</span>
            </div>
        </div>
    )
}

export default Footer;