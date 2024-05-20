const { Schema, model, Collection } = require("mongoose");

const replies = new Schema({
    commentId: {
        type  : Schema.ObjectId,
    },
    replyId : {
        type  : Schema.ObjectId
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

const Replies = new model('replies', replies);
module.exports = Replies;