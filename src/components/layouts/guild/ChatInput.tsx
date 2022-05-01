import { FC, MutableRefObject, useContext, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { createMessage, uploadFile } from "../../../utils/api";
import { ChannelContext } from "../../../utils/contexts/ChannelContext";
import { infQuery, message } from "../../../utils/types";
import { IoIosAddCircle } from "react-icons/io";
import FormData from 'form-data';
import style from "./channelLayout.module.scss";
import FilePreview from "../../message/FilePreview";
import { UserContext } from "../../../utils/contexts/UserContext";
import { useRouter } from "next/router";
import Head from "next/head";

const ChatInput: FC = () => {
    const { channel, socket, setScroll, scroll, setChannel, channels, channelType } = useContext(ChannelContext);
    const { user } = useContext(UserContext);

    const uploadRef = useRef() as MutableRefObject<HTMLInputElement>;
    const router = useRouter();

    const [uploadStop, setUploadStop] = useState<boolean>(false);

    const channelId = router.query.id as string;
    const guildId = router.query._id as string;

    const [content, setContent] = useState<string>("");
    const [file, setFile] = useState<File>();
    const queryClient = useQueryClient();

    const { mutate } = useMutation(createMessage, {
        onSuccess: (data) => {
            setUploadStop(false);
            const cache = queryClient.getQueryData<infQuery>(["channel", channelId]);

            if (cache && data) {
                const messages = cache.pages[0].messages;
                if (messages.length < 20) {
                    messages.unshift(data);
                } else {
                    let lastEl = messages[messages.length - 1];
                    messages.unshift(data);
                    messages.pop();

                    for (const page of cache.pages) {
                        if (page === cache.pages[cache.pages.length - 1] && page.messages.length === 20) {
                            cache.pages.push({ messages: [lastEl], nextId: page.nextId });
                            break;
                        }

                        if (page === cache.pages[0]) continue;

                        if (page.messages.length < 20) {
                            page.messages.unshift(lastEl);
                            break;
                        }

                        page.messages.unshift(lastEl);
                        lastEl = page.messages[page.messages.length - 1];
                        page.messages.pop();
                    }
                }
            }

            const newData = {
                id: channelId,
                msg: data,
                guild: guildId ? guildId : null
            }
            
            queryClient.setQueryData(["channel", channelId], cache);

            socket?.emit("create_message", newData);
        }
    });

    const sendMessage = async (e: any) => {
        e.preventDefault();

        if (uploadStop) return;
        setUploadStop(true);

        if (content.length < 1 && !file) return

        let url = ""

        if (file) {
            if (file.size > 1024 * 1024 * 20) return alert("Soubor je vetší než 20MB");

            const data = new FormData();

            data.append("file", file);

            url = await uploadFile(data);
        }

        const msg = {
            content,
            media: {
                link: url,
                type: (url.length > 1 ? file?.type : "")!
            },
            author: user?._id!,
            channel: channelId
        }

        setScroll([scroll[0], false]);
        setContent("");
        setFile(undefined);

        mutate({
            id: channelId,
            msg
        });
    }

    const openUpload = () => {
        uploadRef.current.click();
    }

    const onFileChange = (e: any) => {
        e.preventDefault();

        setFile(e.target.files![0]);
    }

    useEffect(() => {
        if (channelType === "guild") {
            setChannel(channels?.find(c => c._id === channelId)!);
        }
    });

    return (
        <div className={`${style.input_bar} ${file ? `${style.preview}` : ``}`}>
            <Head>
                <title>{channel?.type === "dm" ? (channel.users[0]._id === user?._id ? channel.users[1].username : channel.users[0].username) : channel?.name}</title>
            </Head>
            <div className={style.input}>
                {file ? (<FilePreview file={file} fileSet={setFile}/>) : (<div/>)}

                <div className={style.text_input}>
                    <input type="file" ref={uploadRef} style={{ display: "none" }} onChange={onFileChange} />
                    <IoIosAddCircle size={26} className={style.add} onClick={openUpload} />
                    
                    <form>
                        <input type="text" value={content} placeholder={`Zpráva ${channelType === "dm" ? `@` : `#`}${channel?.type === "dm" ? (channel.users[0]._id === user?._id ? channel.users[1].username : channel.users[0].username) : channel?.name}`} onChange={(e) => setContent(e.target.value)} />
                        <button onClick={ async (e) => sendMessage(e)} className={style.input_btn} type="submit" >posrart zpravu</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ChatInput;