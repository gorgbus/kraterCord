import mongoose, { Schema } from "mongoose";

export interface guild {
    _id: string;
    name: string;
    avatar: string;
    firstChannel: string;
}

const GuildSchema = new Schema<guild>({
    name: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    avatar: {
        type: mongoose.SchemaTypes.String,
    },
    firstChannel: {
        type: mongoose.SchemaTypes.String,
        required: true,
    }
});

export default mongoose.model("guilds", GuildSchema);