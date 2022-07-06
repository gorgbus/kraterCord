import { FC } from "react"

export const FriendIcon: FC<{ size: string; color: string }> = ({ size, color }) => {
    return <svg className={`text-${color}`} x="0" y="0" aria-hidden="true" width={size} height={size} viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path fill="currentColor" fillRule="nonzero" d="M0.5,0 L0.5,1.5 C0.5,5.65 2.71,9.28 6,11.3 L6,16 L21,16 L21,14 C21,11.34 15.67,10 13,10 C13,10 12.83,10 12.75,10 C8,10 4,6 4,1.5 L4,0 L0.5,0 Z M13,0 C10.790861,0 9,1.790861 9,4 C9,6.209139 10.790861,8 13,8 C15.209139,8 17,6.209139 17,4 C17,1.790861 15.209139,0 13,0 Z" transform="translate(2 4)"></path><path d="M0,0 L24,0 L24,24 L0,24 L0,0 Z M0,0 L24,0 L24,24 L0,24 L0,0 Z M0,0 L24,0 L24,24 L0,24 L0,0 Z"></path></g></svg>
}

export const AddIcon: FC<{ size: string; color: string }> = ({ size, color }) => {
    return <svg className={`text-${color}`} x="0" y="0" aria-hidden="false" width={size} height={size} viewBox="0 0 18 18"><polygon fillRule="nonzero" fill="currentColor" points="15 10 10 10 10 15 8 15 8 10 3 10 3 8 8 8 8 3 10 3 10 8 15 8"></polygon></svg>
}

export const CloseIcon: FC<{ size: string; color: string; }> = ({ size, color }) => {
    return <svg className={`text-${color}`} aria-hidden="false" width={size} height={size} viewBox="0 0 24 24"><path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"></path></svg>
}

export const AcceptIcon: FC<{ size: string; color: string; }> = ({ size, color }) => {
    return <svg className={`text-${color}`} aria-hidden="false" width={size} height={size} viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M8.99991 16.17L4.82991 12L3.40991 13.41L8.99991 19L20.9999 7.00003L19.5899 5.59003L8.99991 16.17Z"></path></svg>
}

export const MessageIcon: FC<{ size: string; color: string; }> = ({ size, color }) => {
    return <svg className={`text-${color}`} aria-hidden="false" width={size} height={size} viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="M4.79805 3C3.80445 3 2.99805 3.8055 2.99805 4.8V15.6C2.99805 16.5936 3.80445 17.4 4.79805 17.4H7.49805V21L11.098 17.4H19.198C20.1925 17.4 20.998 16.5936 20.998 15.6V4.8C20.998 3.8055 20.1925 3 19.198 3H4.79805Z"></path></svg>
}