db.products.aggregate([
    {$match : {price : {$gt : 1200}}},
    {
        $group : {
            _id : "$category",
            totalPrice : {$sum : "$price"}
        }
    },
    {$sort : {totalPrice : -1}}
])

const data = await db.comments.aggregate([
    {
        $match:{postId : ObjectId("660e6daf71c0e68ce622952b")}
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
    },
]);