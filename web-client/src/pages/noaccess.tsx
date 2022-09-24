import { NextPage } from "next";
import { useRouter } from "next/router";

const NoAccess: NextPage = () => {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700">
            <div className="flex flex-col items-center justify-between w-64 h-32 font-semibold text-gray-100 bg-gray-700 rounded-md drop-shadow-lg">
                <h1 className="p-4">Tvůj účet nemá přístup</h1>

                <button onClick={() => router.push('/')} className="w-[calc(100%-1rem)] m-4 uppercase rounded p-2 bg-blue-600 hover:bg-blue-700 transition-all">ok</button>
            </div>
        </div>
    )
}

export default NoAccess;