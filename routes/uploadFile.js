const multer = require("multer")
var express = require('express');
var router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    },
})

const uploadStorage = multer({ storage: storage })

// Single file
router.post("/upload/single", uploadStorage.single("file"), (req, res) => {
    const Id = req.userId;
    return res.send({
        message: "SINGLE FILE",
        data: req.file
    })
})

// MULTIPLE FILES
router.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
    return res.send({
        message: "MUTIPLE FILES",
        data: req.files
    })
})


module.exports = router


