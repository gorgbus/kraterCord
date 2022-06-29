import mongoose, { Schema } from "mongoose";

export interface member {
    _id: string;
    discordId: string;
    username: string;
    avatar: string;
    hash: string;
    status: string;
    friends: member[];
    friendRequests: {
        friend: member,
        type: string;
    }[];
}

const MemberSchema = new Schema<member>({
    discordId: {
        type: mongoose.SchemaTypes.String,
        required: true,
        unique: true
    },
    username: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    avatar: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    hash: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    status: {
        type: mongoose.SchemaTypes.String,
        required: true,
    },
    friends: [
        {
            type: mongoose.SchemaTypes.String,
        }
    ],
    friendRequests: [
        {
            friend: {
                type: mongoose.SchemaTypes.String,
            },
            type: {
                type: mongoose.SchemaTypes.String,
            }
        }
    ],
});

export default mongoose.model("members", MemberSchema);