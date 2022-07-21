import { FC, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../utils/api";

const Login: FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const auth = await isAuthenticated()

            if (auth) {
                navigate("/app");
            }
        }

        checkAuth();
    }, []);

    return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-tr from-gray-800 to-gray-700">
            <button onClick={() => window.location.href = `http://localhost:3001/api/auth/discord?redir=${window.location.href}`} className="p-2 font-bold text-white bg-blue-500 rounded-md ">
                Přihlásit se
            </button>
        </div>
    )
}

export default Login;
