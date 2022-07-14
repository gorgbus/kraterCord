import { FC, ReactNode } from "react";

interface Props {
    size?: string;
    addtionalClassName?: string;
    content: ReactNode;
}

const Modal: FC<Props> = ({ size = 'h-2/5 w-[30%]', content, addtionalClassName }) => {
    return (
        <div className='fixed top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-75'>
            <div className={`${size} bg-gray-700 rounded-md ${addtionalClassName}`}>
                {content}
            </div>
        </div>
    )
}

export default Modal;