const { Schema, model, Collection } = require("mongoose");

const likeSchema = new Schema({
    postId: {
        type  : Schema.ObjectId,
        required: true,
    },
    uid : {
        type  : Schema.ObjectId, 
        required : true
    }

})

// create a model or a collection

const Like = new model('likes', likeSchema);
module.exports = Like;