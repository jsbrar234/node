var express = require('express');
const { default: mongoose } = require('mongoose');
const { auth } = require("../middleware/auth");
const { uploadStorage } = require('../middleware/multer');
const { Posts } = require("../models/userPost");;
var router = express.Router();




// Single file
router.post("/upload/singlePost", auth, uploadStorage.single("file"), async (req, res) => {
    const Id = req.userId;
    let record = await Posts.create({
        images: req.file,
        uid: Id
    })

    if (record) {
        return res.send({
            message: "SINGLE FILE",
            data: record
        })
    }
})

// MULTIPLE FILES

router.post("/upload/multiplePosts", auth, uploadStorage.array("file", 10), async (req, res) => {
    try {
        return res.status(201).send({
            message: "Multiple files uploaded successfully",
            record: req.files
        });

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }
});

// POST IMAGE DATA AND TITLE DESCRIPTION

router.post("/postData", auth, async (req, res) => {
    try {

        const userId = req.userId

        const data = {
            title: req.body.title,
            description: req.body.description
        }

        const record = await Posts.create({
            images: req.body.images,
            uid: userId,
            title: data.title,
            description: data.description
        });

        if (record) {
            res.status(200).send({
                data: record
            })
        }

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }
});

router.get("/showPosts", auth, async (req, res) => {
    try {

        const userId = req.userId

        const record = await Posts.find({ uid: userId })

        if (record) {
            res.status(200).send({
                data: record
            })
        }

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        });
    }
});

// SHOW OTHER USER POSTS


router.get("/showOtherUserPosts", auth, async (req, res) => {

    try {
        const Id = req.userId;
        const data = await Posts.find({ uid: { $ne: new mongoose.Types.ObjectId(Id) } })

        const data2 = await Posts.aggregate([
            {
                $match: { uid: { $ne: new mongoose.Types.ObjectId(Id) } }
            },
            {
                $lookup:
                {
                    from: "users",
                    let: { userId : "$uid" },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr: { $eq: ["$_id", "$$userId"] },

                            }
                        },
                    ],
                    as: "user_details"
                }
            }
        ])

        console.log("HELO")
        if (data.length > 0) {
            res.status(200).send({
                data: data2
            })
        }
        else {
            res.status(400).send({
                message: "data not found"
            })
        }

    } catch (error) {
        res.status(500).send("INTERNAL SERVER ERROR")
    }
})



module.exports = router


