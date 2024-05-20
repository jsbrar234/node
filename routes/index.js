var express = require('express');
const { default: mongoose } = require('mongoose');
const { auth } = require('../middleware/auth');
const { Users } = require('../models/users');

// const multer = require("multer")
var router = express.Router();

/* GET home page. */

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


// FOR REAING ALL DATA
router.get('/userList', async (req, res, next) => {

    let pageNo = parseInt(req.query.pageNo)
    let pageLimit = parseInt(req.query.pageLimit)

    let records = await Users.find().skip(pageLimit * (pageNo - 1)).limit(pageLimit).sort({_id:-1})

    if (records.length > 0) {
        return res.status(200).send({
            statusCode: 200,
            message: "USERS RECORD FOUND",
            data: records
        })
    }

    else {
        return res.status(400).send({
            statusCode: 400,
            message: "RECORD NOT FOUND",
        })
    }
});

// FOR CREATING DATA
// router.post('/', async (req, res, next) => {
//   let { fname, lname, gender, city, state, email } = req.body;
//   let record = await Users.create({
//     fname: req.body.fname,
//     lname: req.body.lname,
//     gender: req.body.gender,
//     city: req.body.city,
//     state: req.body.state,
//     email: req.body.email,
//     password: req.body.password,
//   })
//   return res.status(200).send({
//     statusCode: 200,
//     message: "USERS ACCOUNT CREATED",
//     data: record
//   })
// })

// FOR READING SINGLE DATA 

router.get('/getUserData', auth, async (req, res, next) => {
    let record = await Users.findOne({ _id: new mongoose.Types.ObjectId(req.userId) });
    res.send({ message: record })
});

// FOR UPDATING DATA

// router.put('/update/:id', async (req, res, next) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return res.status(400).send({
//       statusCode: 400,
//       message: "Invalid Object Id",
//     })
//   }

//   let upid = req.params.id;
//   let upfname = req.body.fname;
//   let uplname = req.body.lname;
//   let upgender = req.body.gender;
//   let upcity = req.body.city;
//   let upstate = req.body.state;
//   let upemail = req.body.email;
//   let password = req.body.password;
//   let cpassword = req.body.cpassword;

//   let data = await Users.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(upid) }, { $set: { fname : upfname, lname : uplname, gender : upgender, city : upcity, state : upstate, email : upemail } }, { new: true })
//   if (data == null) {
//     return res.status(400).send({
//       statusCode: 400,
//       message: "Data Not Found",
//     })
//   }
//   else {
//     return res.status(200).send({
//       statusCode: 200,
//       message: "USER UPDATED SUCCESSFULLY",
//       data: data
//     })
//   }
// })

// FOR DELETING DATA
// router.delete('/delete/:id', async (req, res) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return res.status(400).send({
//       statusCode: 400,
//       message: "Invalid Object Id",
//     })
//   } 

//     let upid = req.params.id;
//     let data = await Users.deleteOne({ _id: new mongoose.Types.ObjectId(upid) })

//     if (data == null) {
//       return res.status(400).send({
//         statusCode: 400,
//         message: "Data Not Found",
//       })
//     }
//     else {
//       return res.status(200).send({
//         statusCode: 200,
//         message: "USER DELETED SUCCESSFULLY",
//         data: data
//       })
//     }

// })




// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/")
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname)
//   },
// })

// const uploadStorage = multer({ storage: storage })

// // Single file
// router.post("/upload/single", uploadStorage.single("file"), (req, res) => {
//   return res.send({
//     message : "SINGLE FILE", 
//     data : req.file
//   })
// })

// // MULTIPLE FILES
// router.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
//     return res.send({
//         message : "MUTIPLE FILES", 
//         data : req.files
//       })
//   })

module.exports = router;



