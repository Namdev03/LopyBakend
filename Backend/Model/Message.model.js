import { Schema, model } from "mongoose";
const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    receiver:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    message:{
        type: String,
        required: true,
        trim: true
    }
},{timestamps: true})
export default model("Message", messageSchema)