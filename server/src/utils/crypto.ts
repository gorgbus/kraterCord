import CryptoJS from "crypto-js";
import { config } from "dotenv";
config();

export const encrypt = (token: string) => {
    return CryptoJS.AES.encrypt(token, process.env.PASSWORD!).toString();
}

export const decrypt = (token: string) => {
    return CryptoJS.AES.decrypt(token, process.env.PASSWORD!).toString(CryptoJS.enc.Utf8);
}