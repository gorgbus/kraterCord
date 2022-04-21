import { config } from "dotenv";
import mongoose from "mongoose";
config();

mongoose
    .connect(process.env.MONGOOSE!)
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));