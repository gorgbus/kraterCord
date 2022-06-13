import mongoose, { Schema } from "mongoose";

export interface User {
    id: string;
    discordId: string;
    accessToken: string;
    refreshToken: string;
}

const UserSchema = new Schema<User>({
    discordId: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    }
});

export default mongoose.model("users", UserSchema);