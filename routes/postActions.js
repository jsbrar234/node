var express = require('express');
const { default: mongoose } = require('mongoose');
const { auth } = require("../middleware/auth");
const Comments = require('../models/comment');
const Replies = require('../models/commentReply');
const Like = require('../models/likes');
const { Posts } = require("../models/userPost");;
var router = express.Router();




// FOR COMMENTING ON POST
router.post("/comment", auth, async (req, res) => {
    const Id = req.userId;
    const postId = req.body.postId

    const data = await Comments.create({
        postId: postId,
        uid: Id,
        message: req.body.message
    })

    if (data) {
        res.status(200).send({
            message: "comment posted",
            data: data
        })
    }
    else {
        res.status(400).send({
            message: "comment not posted",
        })
    }
})

// GET COMMENTS


router.get('/getComments/:postId', async (req, res, next) => {
    try {
        const postIdObj = new mongoose.Types.ObjectId(req.params.postId);

        const data = await Comments.aggregate([
            {
                $match: { postId: postIdObj }
            },
            {
                $lookup:
                {
                    from: "users",
                    let: { userId: "$uid" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: { $eq: ["$_id", "$$userId"] },

                            }
                        },
                    ],
                    as: "User_details"
                }
            }

        ]);

        if (data) {
            res.status(200).send({ data: data })
        }

        // else {
        //     res.status(400).send({ message: "Data not Found" })
        // }
    } catch (error) {
        res.status(404).send("ERRORt");
    }
})

// FOR LIKING POSTS

router.post('/like', auth, async (req, res, next) => {
    try {
        const postId = req.body.postId;
        const Id = req.userId;

        const mongoId = new mongoose.Types.ObjectId(Id)

        const checkLike = await Like.findOne({ uid: mongoId })

        if (checkLike) {
            const unlike = await Like.deleteOne({ uid: mongoId })
            if (unlike) {
                return res.status(200).send({
                    message: "Post Unliked",
                    isLiked: false
                })
            }
        }


        const data = await Like.create({
            postId: postId,
            uid: Id,
        })

        if (data) {
            res.status(200).send({
                message: "Post Liked",
                data: data,
                isLiked: true
            })
        }
        else {
            res.status(400).send("Failed to Like the Post")
        }
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }

})

// FOR SHOWING LIKES

router.get('/getLikes', async (req, res, next) => {
    try {
        const postId = req.body.postId;

        const likes = await Like.find({ postId: new mongoose.Types.ObjectId(postId) }).count()

        console.log("LIKES", likes)

        if (likes) {
            res.status(200).send({ likes: likes })
        }
        else {
            res.status(200).send({ likes: likes })
        }


    } catch (error) {
        res.status(500).send("Internal Server Error")
    }

})

// FOR SHOWING FULL POST DATA

router.get('/getPostData', async (req, res, next) => {
    const postId = new mongoose.Types.ObjectId(req.body.postId);



    const data = await Posts.aggregate([
        {
            $lookup:
            {
                from: "users",
                let: { userId: "$uid" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr: { $eq: ["$_id", "$$userId"] },

                        }
                    },
                ],
                as: "PostedBy"
            }
        },
        {
            $unwind: "$PostedBy"
        },
        {
            $lookup:
            {
                from: "comments",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr: { $eq: ["$postId", "$$postId"] },

                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { userId: "$uid" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ["$_id", "$$userId"] }
                                    }
                                }
                            ],
                            as: "commentedBy"
                        }
                    },
                    // {
                    //     $lookup: {
                    //         from: "replies",
                    //         let: { commentId: "$_id" },
                    //         pipeline: [
                    //             {
                    //                 $match: {
                    //                     $expr: { $eq: ["$commentId", "$$commentId"] }
                    //                 }
                    //             },
                    //             {
                    //                 $lookup: {
                    //                     from: "users",
                    //                     let: { userId: "$uid" },
                    //                     pipeline: [
                    //                         {
                    //                             $match: {
                    //                                 $expr: { $eq: ["$_id", "$$userId"] }
                    //                             }
                    //                         },
                    //                     ],
                    //                     as: "repliedBy"
                    //                 }
                    //             },

                    //             {
                    //                 $lookup: {
                    //                     from: "comments",
                    //                     let: { commentId: "$commentId" },
                    //                     pipeline: [
                    //                         {
                    //                             $match: {
                    //                                 $expr: { $eq: ["$_id", "$$commentId"] }
                    //                             }
                    //                         },
                    //                         {
                    //                             $lookup: {
                    //                                 from: "users",
                    //                                 let: { userId: "$uid" },
                    //                                 pipeline: [
                    //                                     {
                    //                                         $match: {
                    //                                             $expr: { $eq: ["$_id", "$$userId"] }
                    //                                         }
                    //                                     },
                    //                                 ],
                    //                                 as: "userDetail"
                    //                             }
                    //                         },
                    //                         {
                    //                             $unwind : "$userDetail"
                    //                         }
                    //                     ],
                    //                     as: "repliedOn"
                    //                 }
                    //             },
                    //             {
                    //                 $unwind : "$repliedOn"
                    //             },
                    //             {
                    //                 $unwind: "$repliedBy" 
                    //             }
                    //         ],
                    //         as: "replies"
                    //     }
                    // },

                    {
                        $unwind: "$commentedBy"
                    }
                ],
                as: "comments"
            }
        },
        {
            $lookup:
            {
                from: "likes",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr: { $eq: ["$postId", "$$postId"] },


                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { userId: "$uid" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: { $eq: ["$_id", "$$userId"] }
                                    }
                                }
                            ],
                            as: "likedBy"
                        }
                    },
                    {
                        $unwind: "$likedBy"
                    }
                ],
                as: "likes"
            }
        },
        {
            $addFields: { "likesCount": { $size: "$likes" } }
        },
        {
            $addFields: { "commentsCount": { $size: "$comments" } }
        }
    ]);

    console.log("DATA", data)
    if (data) {
        res.status(200).send({ data: data })
    }
    else {
        res.status(400).send("DATA NOT FOUND")
    }

})
// GET REPLIES

router.post('/getReply', async (req, res, next) => {
    try {
        const commentId = req.body.commentId
        
        // console.log('commentId', commentId)
        const replies = await Comments.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(commentId) },
            },
            {
                $lookup: {
                    from: "replies",
                    let: { comId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$commentId", "$$comId"] }
                            }
                        }
                    ],
                    as: "commentReplies"
                }
            }

        ]);

        if (replies) {
            res.status(200).send({ data: replies });
        } else {
            res.status(400).send("DATA NOT FOUND");
        }
    } catch (error) {
        // Handle error
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



// COMMENT REPLY

router.post('/commentReply', auth, async (req, res, next) => {
    try {
        const Id = req.userId;
        if (req.body.replyId && req.body.commentId) {
            const replyId = req.body.replyId

            const data = await Replies.create({
                commentId : req.body.commentId,
                replyId: new mongoose.Types.ObjectId(replyId),
                uid: new mongoose.Types.ObjectId(Id),
                message: req.body.message
            })

            if (data) {
                res.status(200).send({
                    message: "Replied to Reply Successfully",
                    data: data
                })
            }
            else {
                res.status(400).send("ERROR")
            }
        }
        else {
            const commentId = req.body.commentId

            const data = await Replies.create({
                commentId: new mongoose.Types.ObjectId(commentId),
                uid: new mongoose.Types.ObjectId(Id),
                message: req.body.message
            })

            if (data) {
                res.status(200).send({
                    message: "Replied To Comment Successfully",
                    data: data
                })
            }
            else {
                res.status(400).send("ERROR")
            }
        }


    } catch (error) {
        res.status(500).send("Internal Server Error")
    }

})



module.exports = router;


