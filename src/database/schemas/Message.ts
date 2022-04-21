import mongoose, { Schema } from "mongoose";
import { member } from "./Member";

export interface message {
    _id: string;
    content: string;
    media: {
        link: string;
        type: string;
    };
    author: member;
    channel: string;
}

const MessageSchema = new Schema<message>({
    content: {
        type: mongoose.SchemaTypes.String
    },
    media: {
        link: {
            type: mongoose.SchemaTypes.String,
        },
        type: {
            type: mongoose.SchemaTypes.String,
        }
    },
    author: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "members",
        required: true
    },
    channel: {
        type: mongoose.SchemaTypes.String,
        required: true,
    }
},
{ 
    timestamps: true 
});

export default mongoose.model("messages", MessageSchema);