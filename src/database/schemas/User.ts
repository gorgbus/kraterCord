import mongoose, { Schema } from "mongoose";

export interface User {
    id: string;
}

const UserSchema = new Schema<User>({
    id: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    }
});

export default mongoose.model("users", UserSchema);