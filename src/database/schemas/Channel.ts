import mongoose, { Schema } from "mongoose";

export interface channel {
    _id: string;
    name: string;
    type: string;
    users: {
        user: string;
        muted: boolean;
        deafen: boolean;
    }[];
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
            user: {
                type: mongoose.SchemaTypes.String,
            },
            muted: {
                type: mongoose.SchemaTypes.Boolean,
            },
            deafen: {
                type: mongoose.SchemaTypes.Boolean,
            }
        }
    ],
    guild: {
        type: mongoose.SchemaTypes.String,
    }
});

export default mongoose.model("channels", ChannelSchema);