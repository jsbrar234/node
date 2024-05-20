var express = require('express');
const { default: mongoose } = require('mongoose');
const { auth } = require('../middleware/auth');
const Feedback = require('../models/feedback');
const { Users } = require('../models/users');
var router = express.Router();


// FOR POSTING FEEDBACK DATA
router.post('/feedback', auth, async (req, res, next) => {
    try {
        const response = req.body
        const Id = req.userId;

        const data = await Users.findOne({ _id: req.userId })


        const mergeData = {
            email: data.email,
            subject: response.subject,
            message: response.message,
            uid: Id
        }
        // if(response.username===""){
        //     return res.status(500).json({message  : "please enter your username"});
        // }
        // if(response.email===""){
        //     return res.status(500).json({message  : "please enter your email"});
        // }
        // if(response.message===""){
        //     return res.status(500).json({message  : "please enter your message"});
        // }

        console.log(Id)
        const uploaded = await Feedback.create(mergeData)
        if (uploaded) {
            return res.status(200).json({ message: "message delivered" });
        }
        else {
            return res.status(400).json({ message: "message not delivered" })
        }
    } catch (error) {
        return res.status(500).json({ message: "message not delivered" })
    }
})


//   FOR GETTING FEEDBACK DATA FOR USER


router.get('/userFeedbackData', auth, async (req, res, next) => {
    try {


        let pageNo = parseInt(req.query.pageNo)
        let pageLimit = parseInt(req.query.pageLimit)

        const Id = req.userId
        const data = await Feedback.find({ uid: Id }).skip(pageLimit * (pageNo - 1)).limit(pageLimit)

        if (data) {
            res.status(200).send({ val: data })
        }
        else {
            res.status(400).send({ message: "Data not Found" })
        }
    } catch (error) {

    }
})


router.get('/allUsers', async (req, res, next) => {
    try {

        let pageNo = parseInt(req.query.pageNo) || 1
        let pageLimit = parseInt(req.query.pageLimit) || 10
        let userId = req.query.userId;

        let criteria = {}
        if (req.query.userId) {
            criteria._id= new mongoose.Types.ObjectId(userId)
        }
        const Id = req.userId

        const data = await Users.aggregate([
            {
                $match:criteria
            },
            {
                $lookup:
                {
                    from: "feedbacks",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: { $eq: ["$uid", "$$userId"] },

                            }
                        },
                    ],
                    as: "feedback_Details"
                }
            },
            {
                $project: {
                    _id: 1,
                    "email": 1,
                    "subject": 1,
                    "message": 1,
                    "uid": 1,
                    feedback_Details: 1
                }


            },
            {
                $facet:
                {
                    data: [{ $skip: pageLimit * (pageNo - 1) }, { $limit: pageLimit }],
                    count: [{ $count: "count" }],
                }
            }
        ]);



        if (data[0].data.length > 0) {
            return res.status(200).send({
                totalCount: data[0].count[0].count,
                data: data[0].data,

            })
        }
        else {
            res.status(400).send({ message: "Data not Found" })
        }
    } catch (error) {

    }
})


// router.get('/single-user-feedback-data/:id', async (req, res, next) => {
//     try {
//         let id = req.params.id
//         console.log("ID", id)
//         const data = await Feedback.find({ uid: id })

//         if (data[1]) {
//             return res.status(200).send({
//                 data: data
//             })
//         }
//         else {
//             return res.status(404).send({
//                 data: ""
//             })
//         }
//     } catch (error) {
//         // console.log(error)
//     }
// })

module.exports = router;