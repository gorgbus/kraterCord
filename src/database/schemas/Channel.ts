import mongoose, { Schema } from "mongoose";

export interface channel {
    _id: string;
    name: string;
    type: string;
    users: string[];
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
            type: mongoose.SchemaTypes.String,
        }
    ],
    guild: {
        type: mongoose.SchemaTypes.String,
    }
});

export default mongoose.model("channels", ChannelSchema);