import { Request, Response } from "express";
import Multer from "multer";
import { Storage } from "@google-cloud/storage";
import { config } from "dotenv";
config();

const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT,
    credentials: {
        client_email: process.env.GCLOUD_CLIENT_EMAIL,
        private_key: process.env.GCLOUD_PRIVATE_KEY
    }
})

const bucket = storage.bucket(process.env.GCS_BUCKET!);

export const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 
    }
}).single("file");

export async function uploadController(req: Request, res: Response) {
    const newFileName = `${Date.now()}-${req.file?.originalname}`;
    const blob = bucket.file(newFileName);
    const blobStream = blob.createWriteStream()

    blobStream.on("error", err => {
        console.log(err)
        res.status(500).json(err);
    });

    blobStream.on("finish", () => {
        const url = `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${blob.name}`;
        console.log(req.file);
        res.status(200).json({ file: req.file, url });
    })

    blobStream.end(req.file?.buffer);
}