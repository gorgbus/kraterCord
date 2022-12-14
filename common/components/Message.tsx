import { FC } from "react";
import { BaseProps, Message, Optional } from "@kratercord/common/types";
import { memo } from "react";

interface Props extends Optional<Optional<BaseProps, "params">, "navigate"> {
    msg: Message;
    compact: boolean;
    last: boolean;
}

const MessageComponent: FC<Props> = ({ msg, compact, last, Image }) => {
    const formatDate = (timestamp: any) => {
        let dt = new Date(timestamp),
            date = dt.getDate(),
            diffDays = new Date().getDate() - date,
            diffMonths = new Date().getMonth() - dt.getMonth(),
            diffYears = new Date().getFullYear() - dt.getFullYear();

        if (diffYears === 0 && diffDays === 0 && diffMonths === 0) {
            return `dnes ${dt.toLocaleTimeString().slice(0, -3)}`;
        } else if (diffYears === 0 && diffDays === 1) {
            return `včera ${dt.toLocaleTimeString().slice(0, -3)}`;
        }

        return `${dt.getDate()}.${dt.getMonth() + 1}.${dt.getFullYear()}`
    }

    return (
        <div>
            {
                !compact &&
                (
                    <div className={`grid mt-3 message hover:bg-gray-800 hover:bg-opacity-30 ${last ? `mb-3` : ``}`}>
                        <Image width={36} height={36} className="mt-1 ml-2 rounded-full w-9 h-9 avatar" src={msg.member?.avatar || msg.author.avatar} alt={`${msg.author.username}:avatar`} />

                        <div className="content mt-[-36px]">
                            <div className="info">
                                <span className="mr-2 text-sm font-semibold text-gray-100">{msg.member?.nickname || msg.author.username}</span>
                                <span className="text-xs font-semibold text-gray-300">{formatDate(msg.createdAt)}</span>
                            </div>

                            <span className="text-gray-200">{msg.content}</span>
                        </div>
                    </div>
                )
            }

            {
                compact &&
                (
                    <div className={`grid compact hover:bg-gray-800 hover:bg-opacity-30 ${last ? `mb-3` : ``}`}>
                        <span className="hidden text-[0.6rem] text-gray-300 font-semibold mt-1 ml-5">{new Date(msg.createdAt).toLocaleTimeString().slice(0, -3)}</span>

                        <span className="m-0 text-gray-200">{msg.content}</span>
                    </div>
                )
            }
        </div>
    )
}

export default memo(MessageComponent);

// const StyledContent: FC<{ content: string }> = ({ content }) => {
//     return (
//         <>
//             <span className="text-gray-200">
//                 <ReactMarkdown disallowedElements={[""]} >{content}</ReactMarkdown>
//             </span>
//         </>
//     )
// }