const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
    images: [String],
    uid: {
        type: Schema.ObjectId,
        required : true,
    },
    title: {
        type: String,
        required : true,
    },
    description: {
        type: String,
        required : true,
    }

},
    { timestamps: true }
);

const Posts = mongoose.model('posts', postSchema);

module.exports.Posts = Posts; 