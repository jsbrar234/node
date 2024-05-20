let jwt = require('jsonwebtoken');


const auth=async(req,res,next)=>{
    if(!(req.header("Authorization")))
    {
        return res.status(400).send({
            statusCode: 400,
            message: "Token required",
          })
    }

    let token=req.header("Authorization");
    let decoded=  jwt.verify(token,'login')
    req.userId=decoded.userId;
    next();
    }


module.exports.auth=auth