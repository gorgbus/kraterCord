import { FC } from "react";
import { useSettings } from "@kratercord/common/store/settings";
import { FriendIcon } from "../../Icons";

const FriendBar: FC = () => {
    const page = useSettings(state => state.page);
    const setPage = useSettings(state => state.setPage);

    return <div className="font-bold text-white h-12 w-full ml-56 fixed flex items-center bg-gray-700 border-b-[1px] border-gray-900">
        <div className="m-2">
            <FriendIcon color="gray-400" size="24" />
        </div>

        <h3 className="text-sm text-gray-100">Přátelé</h3>

        <div className="h-6 w-[0.1rem] m-2 bg-gray-500"></div>

        <div className="flex items-center">
            <Button content="Online" />
            <Button content="Vše" />
            <Button content="Nevyřízeno" />

            <div className={`rounded-md cursor-pointer ${page === "add" ? `bg-transparent hover:bg-gray-600 text-green-500` : `bg-green-600 hover:bg-green-700 text-gray-50`} p-1 m-2 text-sm`} onClick={() => setPage("add")} >
                Přidat přítele
            </div>
        </div>
    </div>
}

const Button: FC<{ content: string }> = ({ content }) => {
    const page = useSettings(state => state.page);
    const setPage = useSettings(state => state.setPage);

    return <div className={`${content === page && `bg-gray-600 text-gray-50`} p-1 m-2 text-sm text-gray-300 rounded-md cursor-pointer hover:bg-gray-600 hover:bg-opacity-50`} onClick={() => setPage(content)}>
        {content}
    </div>
}

export default FriendBar;