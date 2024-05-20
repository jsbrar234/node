const mongoose = require('mongoose');
const { Schema } = mongoose;

const sellerSchema = new Schema({
    firstName : {
        type : String,
        default : "",
    },
    lastName : {
        type : String,
        require : true,
    },
    gender : {
        type: String,
        require : true,
    },
    city : {
        type: String,
        require : true,
    },
    state : {
        type : String,
        require: true,
    },
    status : {
        type: String,
        enum:["Active","InActive","Deleted"],
        default:"Active"
    },
    email : {
        type: String,
        require : true,
    },
    password : {
        type: String,
    },
    isVerify : {
        type: Boolean,
        default : false,
    },
    accessToken : {
        type: String,
    },
    accountId : {
        type : String
    },
    otp : {
        type : Number,
    }

},
{ timestamps: true } 
);

const Sellers = mongoose.model('sellers', sellerSchema);

module.exports.Sellers = Sellers; 