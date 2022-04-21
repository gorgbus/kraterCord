const HOST = process.env.NEXT_PUBLIC_HOST;

export const PEERJS_PORT = Number(process.env.NEXT_PUBLIC_PEERJS_PORT);
export const PEERJS_HOST = process.env.NEXT_PUBLIC_PEERJS_HOST;

export const SOCKET_ENDPOINT: string = `${HOST}`;
export const API_URl: string = `${HOST}/api`;