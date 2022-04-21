import { FC } from "react";
import { BsTrashFill } from "react-icons/bs";
import style from "./preview.module.scss";

interface Props {
    file: File;
    fileSet: any;
}

const FilePreview: FC<Props> = ({ file, fileSet }) => {
    const url = URL.createObjectURL(file);
    

    return (
        <div>
            <div className={style.buttons} onClick={() => fileSet(null)}>
                <BsTrashFill size={18}/>
            </div>

            <div className={style.container}>
                <div className={style.image_div}>
                    <img src={url} className={style.image} />
                </div>
                
                <span className={style.name}>
                    {file.name}
                </span>
            </div>
        </div>
        
    )
}

export default FilePreview;