import { FC, MutableRefObject, useEffect, useRef } from "react";
import { message } from "../../utils/types";
import Image from "next/image";
import {  } from 'react-player'
import style from "./message.module.scss";
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";

interface Props {
    msg: message,
}

const Message: FC<Props> = ({ msg }) => {
    const modalRef = useRef() as MutableRefObject<HTMLDivElement>;
    const linkRef = useRef() as MutableRefObject<HTMLDivElement>;
    const modalImgRef = useRef() as MutableRefObject<HTMLImageElement>;

    const formatDate = (timestamp: any) => {
        let dt = new Date(timestamp),
            date = dt.getDate(),
            diffDays = new Date().getDate() - date,
            diffMonths = new Date().getMonth() - dt.getMonth(),
            diffYears = new Date().getFullYear() - dt.getFullYear();

        if (diffYears === 0 && diffDays === 0 && diffMonths === 0){
            return `dnes ${dt.toLocaleTimeString().slice(0, -3)}`;
        } else if(diffYears === 0 && diffDays === 1) {
            return `včera ${dt.toLocaleTimeString().slice(0, -3)}`;
        }

        return `${dt.getDate()}.${dt.getMonth()+1}.${dt.getFullYear()}`
    }

    const renderCorrectEmbed = (type: string) => {
        switch(type.split("/")[0]) { 
            case "image": {
                return (
                    <div className={style.attachment_div}>
                        <img src={msg.media.link} alt="příloha" className={style.attachment} onClick={openModal} />
                    
                        <div className={style.modal} ref={modalRef}>
                            <div className={style.image_preview}>
                                <div className={style.box}>
                                    <img className={style.modal_content} src={msg.media.link} ref={modalImgRef} />
                                    <span className={style.caption} ref={linkRef} onClick={() => window.open(msg.media.link)}>Otevři původní</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            case "video": {
                return (
                    <div className={style.attachment_div}>
                        <VideoPlayer url={msg.media.link}/>
                    </div>
                )
            }

            case "audio": {
                return (
                    <div className={style.attachment_div}>
                        <AudioPlayer url={msg.media.link}/>
                    </div>
                )
            }
        }
    }

    const openModal = () => {
        modalRef.current.style.display = "flex";
    }

    const closeModal = (event) => {
        if (modalImgRef.current && !modalImgRef.current.contains(event.target) && !linkRef.current.contains(event.target)) {
            modalRef.current.style.display = "none";
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", closeModal);
    }, []);

    return (
        <div className={style.container} >
            <Image src={msg.author.avatar} alt="Avatar autora" className={style.avatar} width="36" height="36"/>
            
            <div className={style.content}>
                <div className={style.name_time}>
                    <span>{msg.author.username}</span>
                    <span>{formatDate(msg.createdAt)}</span>
                </div>
            
                <span>{msg.content}</span>
            </div>

            {
                msg.media.link.length > 1 ?
                renderCorrectEmbed(msg.media.type)
                :
                <div></div>
            }
        </div>
    )
}

export default Message;