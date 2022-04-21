import mongoose, { Schema } from "mongoose";
import { member } from "./Member";

export interface channel {
    _id: string;
    name: string;
    type: string;
    users: member[];
    guild: string;
}

const ChannelSchema = new Schema<channel>({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    type: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    users: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "members",
            unique: true
        }
    ],
    guild: {
        type: mongoose.SchemaTypes.String,
    }
});

export default mongoose.model("channels", ChannelSchema);