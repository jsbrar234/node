var express = require('express');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51P3Yj32M0zv9ALj1LHUwHkPPVTwDggLu4L3G9NVndZBqr3xEDF37B8r4xbxwyoZDVURLBJjSNxzGojaS8yOUpeNM00x63mhmWk');
var router = express.Router();
let jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');



router.post('/createProduct', async (req, res, next) => {

    const {name} = req.body
    const product = await stripe.products.create({
        name: name,
    });

    if(product){
        res.status(200).send({
            message : "product added successfully",
            data : product
        })
    }
    else{
        res.status(400).send({
            message : "error",
            data : product
        })
    }
})

// CREATE PRICE OF PRODUCT
router.post('/createPrice', async (req, res, next) => {
const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: 1000,
    product : "prod_PwLV1agWfAKrzQ",
  });

  if(price){
    res.status(200).send({
        message : "Price added successfully",
        data : price
    })
  }
  else{
    res.status(400).send({
        message : "FAILED",
        data : price
    })
  }

})

module.exports = router;