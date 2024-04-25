import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        lowercase: true
    },
    uploadBy: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    author: {
        type: Array,
        required: true,
        lowercase: true
    },
    coverImage: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    genre: {
        type: Array,
        required: true,
        lowercase: true
    }
}, { timestamps: true });

bookSchema.plugin(mongoosePaginate);

const Book = mongoose.model("Book", bookSchema);





export { Book };