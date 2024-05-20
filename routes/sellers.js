var express = require('express');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51P3Yj32M0zv9ALj1LHUwHkPPVTwDggLu4L3G9NVndZBqr3xEDF37B8r4xbxwyoZDVURLBJjSNxzGojaS8yOUpeNM00x63mhmWk');
var router = express.Router();
let jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { Sellers } = require('../models/sellers');


router.post('/sellerSignUp', async (req, res, next) => {


    const account = await stripe.accounts.create({
        type: 'custom',
        country: 'US',
        business_profile : {name : `${req.body.firstName} ${req.body.lastName} `},
        email: req.body.email.toLowerCase(),
        capabilities: {
            card_payments: {
                requested: true,
            },
            transfers: {
                requested: true,
            },
        },
    });

    let record = await Sellers.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        city: req.body.city,
        state: req.body.state,
        email: req.body.email.toLowerCase(),
        password: req.body.password,
        accountId : account.id
    })

    var token = jwt.sign({
        userId: record._id,
    }, 'login');

    record.accessToken = token;
    let data = await record.save();

    console.log("token----", token);
    return res.status(200).send({
        statusCode: 200,
        message: "USERS ACCOUNT CREATED",
        data: data,
        account : account
    })

})

// CREATE LINK OF ACCOUNT
router.post('/createLink', async (req, res, next) => {

    const {accountId} = req.body

    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: 'https://example.com/reauth',
        return_url: 'https://example.com/return',
        type: 'account_onboarding',
      });

      if(accountLink){
        res.status(200).send({
            message : "Account Created Successfully",
            data : accountLink
        })
      }
      else{
        res.status(400).send({
            message : "Error"
        })
      }

})

// CREATE BANK TOKEN
router.post('/createBankToken', async (req, res, next) => {

    const {name, type, routing_number, account_number} = req.body

    const token = await stripe.tokens.create({
        bank_account: {
          country: 'US',
          currency: 'usd',
          account_holder_name: name,
          account_holder_type: type,
          routing_number: routing_number,
          account_number: account_number,
        },
      });

      if(token){
        res.status(200).send({
            message : "Token Created Successfully",
            data : token
        })
      }

      else{
        res.status(400).send({
            message : "TFailed to Create Token",
        })
      }
})

// LINK EXTERNAL BANK ACCOUNT

router.post('/externalAccount', async (req, res, next) => {

    const {accountId, external_account} = req.body;

    const externalAccount = await stripe.accounts.createExternalAccount(
        accountId,
        {
          external_account: external_account,
        }
      );

      if(externalAccount){
        res.status(200).send({
            message : "account linked successfully",
            data : externalAccount
        })
      }

      else{
        res.status(400).send({
            message : "account linking failed"
        })
      }

})


router.post('/deleteExternalAccount', async (req, res, next) => {

    // const deleted = await stripe.accounts.deleteExternalAccount(
    //     'acct_1P66BFRpoSQTIQg1',
    //     'ba_1P68ElRpoSQTIQg11p5Nhvj0'
    //   );
    const deleted = await stripe.accounts.del('acct_1P66BFRpoSQTIQg1');

      if(deleted){
        res.send({
            message : "DELETED",
            data : deleted
        })
      }
      else{
        res.send({
            message : "FAILED",
            data : deleted
        })
      }
})






module.exports = router;