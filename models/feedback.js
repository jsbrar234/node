const { Schema, model, Collection } = require("mongoose");

const feedbackSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    subject : {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true
    },
    uid : {
        type  : Schema.ObjectId, 
        required : true
    }

})

// create a model or a collection

const Feedback = new model('feedback', feedbackSchema);
module.exports = Feedback;