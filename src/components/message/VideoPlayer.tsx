import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import style from "./videoPlayer.module.scss";
import { BsPlayFill, BsPauseFill } from "react-icons/bs";
import { MdReplay, MdFullscreen } from "react-icons/md";
import { IoVolumeMedium } from "react-icons/io5";

interface Props {
    url: string;
}

const VideoPlayer: FC<Props> = ({ url }) => {
    const videoRef = useRef() as MutableRefObject<HTMLVideoElement>;
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

        if (!videoRef.current) {
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
    }

    useEffect(() => {
        playing ? videoRef.current.play() :  videoRef.current.pause();
    }, [playing]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.ontimeupdate = () => {
                if (videoRef.current) {
                    setProgress(videoRef.current.currentTime);

                    barRef.current.value = `${100 * (videoRef.current.currentTime / videoRef.current.duration)}`;

                    barRef.current.style.setProperty("--value", barRef.current.value);
                    barRef.current.style.setProperty("--min", "0");
                    barRef.current.style.setProperty("--max", "100");
                }
            }

            videoRef.current.onended = () => {
                setEnded(true);
                setPlaying(false);
            }

            barRef.current.oninput = () => {
                videoRef.current.pause();

                videoRef.current.currentTime = (Number(barRef.current.value) / 100) * videoRef.current.duration;
                setProgress(videoRef.current.currentTime);

                barRef.current.style.setProperty("--value", barRef.current.value);
                barRef.current.style.setProperty("--min", "0");
                barRef.current.style.setProperty("--max", "100");

                if (videoRef.current.currentTime != videoRef.current.duration) setEnded(false);
            }
        }
    }, [])

    useEffect(() => {
        if (barRef && barRef.current) {
            barRef.current.onchange = () => {
                if (playing) videoRef.current.play();
            }
        }
    })

    return (
        <div className={style.container}>
            <video src={url} height="" className={style.player} ref={videoRef} />

            <div className={style.controls}>
                <div onClick={togglePlaying} className={style.play}>
                    {
                        playing ?
                        <BsPauseFill size={24} />
                        :
                        ended ? <MdReplay size={24} /> : <BsPlayFill size={24}/>
                    
                    } 
                </div>

                <span className={style.timer}>
                    {`${formatTime(Math.floor(progress))}/${formatTime(Math.floor(videoRef.current ? videoRef.current.duration : 0))}`}
                </span>

                <input type="range" className={style.progress_bar} defaultValue={0} max={100} ref={barRef} />

                <IoVolumeMedium size={24} className={style.volume} />
                <MdFullscreen size={24} className={style.volume} onClick={() => videoRef.current.requestFullscreen()} />
            </div>
        </div>
    )
}

export default VideoPlayer;