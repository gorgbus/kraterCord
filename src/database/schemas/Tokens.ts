import mongoose, { Schema } from "mongoose";

export interface Tokens {
    id: string;
    discordId: string;
    accessToken: string;
    refreshToken: string;
}

const TokensSchema = new Schema<Tokens>({
    discordId: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    accessToken: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    refreshToken: {
        type: mongoose.SchemaTypes.String,
        required: true,
    }
});

export default mongoose.model("tokens", TokensSchema);