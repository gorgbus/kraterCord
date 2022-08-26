import { FC } from "react"

const Login: FC = () => {
    return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700">
            <button onClick={() => window.location.href = `http://localhost:3001/api/auth/discord?redir=${window.location.href}`} className="p-2 font-bold text-white transition-all bg-blue-600 rounded-md drop-shadow-lg hover:bg-blue-700 ">
                Přihlásit se
            </button>
        </div>
    )
}

export default Login;
