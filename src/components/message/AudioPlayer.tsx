import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import style from "./audioPlayer.module.scss";
import { FcAudioFile } from "react-icons/fc";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { MdReplay } from "react-icons/md";
import { IoVolumeMedium } from "react-icons/io5";
import { HiOutlineDownload } from "react-icons/hi";

interface Props {
    url: string;
}

const AudioPlayer: FC<Props> = ({ url }) => {
    const [audio] = useState(new Audio(url));
    const barRef = useRef() as MutableRefObject<HTMLInputElement>;

    const urlSlice = url.replace("https://storage.googleapis.com/krater/", "");
    const fileName = urlSlice.split("-")
    fileName.shift();

    const [playing, setPlaying] = useState<boolean>(false);
    const [ended, setEnded] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60) % 60;
        s = s % 60;

        if (!audio.duration) {
            return "-:--"
        }

        return `${min}:${s < 10 ? `0${s}` : s}`;
    }

    const togglePlaying = () => {
        setPlaying(!playing);

        if (ended) {
            setProgress(0);
            setEnded(false);
        }

        playing ? audio.pause() :  audio.play();
    }

    useEffect(() => {
        if (audio) {
            audio.ontimeupdate = () => {
                setProgress(audio.currentTime);

                if (barRef && barRef.current) {
                    barRef.current.value = `${100 * (audio.currentTime / audio.duration)}`;
                
                    barRef.current.style.setProperty("--value", barRef.current.value);
                    barRef.current.style.setProperty("--min", "0");
                    barRef.current.style.setProperty("--max", "100");
                }
            }

            audio.onended = () => {
                setEnded(true);
                setPlaying(false);
            }

            barRef.current.oninput = () => {
                audio.pause();

                audio.currentTime = (Number(barRef.current.value) / 100) * audio.duration;
                setProgress(audio.currentTime);

                barRef.current.style.setProperty("--value", barRef.current.value);
                barRef.current.style.setProperty("--min", "0");
                barRef.current.style.setProperty("--max", "100");

                if (audio.currentTime != audio.duration) setEnded(false);;
            }
        }

        return () => {
            audio.pause();
        }
    }, [])

    useEffect(() => {
        if (barRef && barRef.current) {
            barRef.current.onchange = () => {
                if (playing) audio.play();
            }
        }
    })

    return (
        <div className={style.container}>
            <div className={style.info}>
                <FcAudioFile size={34} />

                <span onClick={() => window.open(url)} >{fileName.join("-")}</span>

                <div className={style.download} onClick={() => window.open(url)} >
                    <HiOutlineDownload size={26} />
                </div>
            </div>

            <div className={style.bar}>
                <div onClick={togglePlaying} className={style.play}>
                    {
                        playing ?
                        <BsPauseFill size={24} />
                        :
                        ended ? <MdReplay size={24} /> : <BsPlayFill size={24}/>
                    
                    } 
                </div>
                

                <span className={style.timer}>
                    {`${formatTime(Math.floor(progress))}/${formatTime(Math.floor(audio.duration))}`}
                </span>

                <input type="range" className={style.progress_bar} defaultValue={0} max={100} ref={barRef} />

                <IoVolumeMedium size={24} className={style.volume} />
            </div>
        </div>
    )
}

export default AudioPlayer;