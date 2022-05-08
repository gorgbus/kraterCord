import mongoose, { Schema } from "mongoose";

export interface notif {
    guild: string;
    channel: string;
    count: number;
    createdOn: Date;
}

export interface notifs {
    user: string;
    notifs: notif[];
}

const NotifSchema = new Schema<notifs>({
    user: {
        type: mongoose.SchemaTypes.String,
        required: true
    },
    notifs: [
        {
            guild: {
                type: mongoose.SchemaTypes.String,
            },
            channel: {
                type: mongoose.SchemaTypes.String,
                required: true,
            },
            count: {
                type: mongoose.SchemaTypes.Number,
                required: true,
            },
            createdOn: {
                type: mongoose.SchemaTypes.Date,
                required: true,
            }
        }
    ]
});

export default mongoose.model("notifs", NotifSchema);