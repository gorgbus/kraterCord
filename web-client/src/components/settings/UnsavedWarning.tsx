import { FC } from "react";
import { LoadingIcon } from "../ui/Icons";

const UnsavedWarning: FC<{ save: () => Promise<void> | void; discard: () => void; saving: boolean; }> = ({ save, discard, saving }) => {
    return (
        <div className="absolute left-0 z-20 flex items-center justify-between w-full h-10 bg-gray-900 rounded-md animate-slideFromBottom bottom-12">
            <span className="ml-2 text-sm font-semibold text-gray-100">Máš tu neuložené změny!</span>

            <div className="flex items-center mr-2">
                <button disabled={saving} onClick={discard} className="text-sm font-semibold text-gray-100">Obnovit</button>
                <button disabled={saving} onClick={save} className="flex items-center justify-center p-1 pl-2 pr-2 ml-2 text-sm font-semibold text-gray-100 bg-green-600 rounded-md hover:bg-green-700">{saving ? <LoadingIcon size='16' color="fill-gray-100" /> : 'Uložit změny'}</button>
            </div>
        </div>
    )
}

export default UnsavedWarning;