import { FC, MutableRefObject, ReactNode, useEffect, useRef } from "react";

interface Props {
    size?: string;
    addtionalClassName?: string;
    saving?: boolean;
    content: ReactNode;
    close: () => void;
}

const Modal: FC<Props> = ({ size = 'h-2/5 w-[30%]', content, addtionalClassName, close, saving }) => {
    const modalRef = useRef() as MutableRefObject<HTMLDivElement>;

    const closeModal = (e: any) => {
        if (modalRef.current && !modalRef.current.contains(e.target) && e.target.id !== "title-bar" && !saving) {
            close();
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', closeModal);

        return () => {
            document.removeEventListener('mousedown', closeModal);
        }
    }, []);

    return (
        <div className='fixed top-0 left-0 z-40 flex items-center justify-center w-full h-full bg-black bg-opacity-75'>
            <div ref={modalRef} className={`${size} bg-gray-700 rounded-md ${addtionalClassName}`}>
                {content}
            </div>
        </div>
    )
}

export default Modal;