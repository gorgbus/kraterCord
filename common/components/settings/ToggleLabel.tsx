import { FC, useState } from "react";
import { AcceptIcon, CloseIcon } from "../Icons";
import useUtil from "@kratercord/common/hooks/useUtil";


const ToggleLabel: FC<{ name: string; value: boolean; label: string; desc?: string; }> = ({ label, desc, value, name }) => {
    const [checked, setChecked] = useState(value);

    const { setSetting } = useUtil();

    return (
        <div className="flex items-center justify-between pt-4 pb-4 border-b-[1px] border-gray-500 cursor-pointer" onClick={() => setChecked(current => {
            setSetting(name, !current);
            return !current
        })}>
            <div className="flex flex-col">
                <span className="font-semibold text-gray-100">{label}</span>
                <span className="text-xs text-gray-400">{desc}</span>
            </div>
            <Toggle name={name} checked={checked} />
        </div>
    )
}

export default ToggleLabel;

const Toggle: FC<{ checked: boolean; name: string; }> = ({ checked, name }) => {
    const finalClass = 'relative w-12 h-6 flex select-none cursor-pointer';
    const togglerClass = `h-6 w-6 border-2 absolute z-10 rounded-full bg-white transition-all duration-300 ease-in-out flex justify-center items-center ${checked ? "transform translate-x-full border-green-500" : "border-gray-500"}`;
    const backgroundClass = `absolute left-0 top-0 h-full w-full transition-all duration-300 ease-in-out ${checked ? `bg-green-500` : `bg-gray-500`} rounded-full`;

    return (
        <div className="flex items-center">
            <input type="checkbox" name={name} defaultChecked={checked} className="hidden" />

            <label className={finalClass} htmlFor={name}>
                <span className={backgroundClass} />
                <span className={togglerClass}>
                    {checked ? <AcceptIcon size="14" color="text-green-500" /> : <CloseIcon size="12" color="gray-500" />}
                </span>
            </label>
        </div>
    )
}