const { Schema, model, Collection } = require("mongoose");

const commentSchema = new Schema({
    postId: {
        type  : Schema.ObjectId,
        required: true,
    },
    uid : {
        type  : Schema.ObjectId, 
        required : true
    },
    message: {
        type: String,
        required: true
    },

})

// create a model or a collection

const Comments = new model('comments', commentSchema);
module.exports = Comments;