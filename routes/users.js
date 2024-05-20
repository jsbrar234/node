var express = require('express');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51P3Yj32M0zv9ALj1LHUwHkPPVTwDggLu4L3G9NVndZBqr3xEDF37B8r4xbxwyoZDVURLBJjSNxzGojaS8yOUpeNM00x63mhmWk');
var router = express.Router();
let jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { Users } = require('../models/users');

const accountSid = 'ACdcd9bd581e0a13834e42bde669a6726c';
const authToken = '999d223c42036ded3b1a47bb0f200d0a';
const client = require('twilio')(accountSid, authToken);

// const accountSid = 'ACdcd9bd581e0a13834e42bde669a6726c';
// const authToken = 'b0066059749ba270d347a7013a2a55fe';
// const client = require('twilio')(accountSid, authToken);


router.post('/signUp', async (req, res, next) => {
  let { fname, lname, gender, city, state, email } = req.body;


  const customer = await stripe.customers.create({
    name: `${req.body.fname} ${req.body.lname} `,
    email: req.body.email,
  });

  console.log("Customer", customer)

  let record = await Users.create({
    firstName: req.body.fname,
    lastName: req.body.lname,
    gender: req.body.gender,
    city: req.body.city,
    state: req.body.state,
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    customerId : customer.id
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
    customer: customer
  })
})

router.get('/test', auth, async (req, res, next) => {
  let user = await Users.findOne({ _id: req.userId })
  return res.status(200).send({
    statusCode: 200,
    message: "USERS ACCOUNT FOUND Succeefully",
    data: user
  })
})

// FOR USER LOGIN
router.post('/login', async (req, res, next) => {
  try {
    let data = req.body;
    let record = await Users.findOne({ email: req.body.email, password: req.body.password })

    console.log("DATA", data);
    console.log("record", record);

    if (record == null) {
      res.status(401).send({ message: "Invalid Credentials" });
    }

    else {
      var token = jwt.sign({
        userId: record._id,
      }, 'login');

      record.accessToken = token;
      let data = await record.save();

      return res.status(200).send({
        statusCode: 200,
        message: "LOG IN SUCCESSFUL",
        accessToken: token
      })
    }
  } catch (error) {
    return res.status(500).send({
      message: "INTERNAL SERVER ERROR",
    })
  }
})

router.get('/test', auth, async (req, res, next) => {
  let user = await Users.find({ _id: req.userId })
  return res.status(200).send({
    statusCode: 200,
    message: "USERS ACCOUNT FOUND Succeefully",
    data: user
  })
})

// FOR FORGETTING PASSWORD AND STORING THE OTP IN DB

router.put('/forgetPassword', async (req, res, next) => {
  try {
    let { email } = req.body;
    let otp = Math.floor(1000 + Math.random() * 9000);

    let check = await Users.findOne({ email })

    if (check) {
      let data = await Users.updateOne({
        email: req.body.email
      },
        {
          $set: {
            otp: otp
          }
        }
      )

      client.messages
        .create({
          body: `YOUR OTP : ${otp}`,
          from: '+14243451409',
          to: '+919888607427'
        })
      return res.status(200).send({
        statusCode: 200,
        message: "Otp send successfully",
      })
    }

    else {
      res.status(401).send({ message: "User does not exist" })
    }

  } catch (error) {
    console.log("ERROR", error)
    res.status(500).send({ message: "Internal Server Error" })
  }
})

// FOR RESENDING OTP

router.put('/resendOtp', async (req, res, next) => {
  try {
    let { email } = req.body;
    let otp = Math.floor(1000 + Math.random() * 9000);
    let data = await Users.updateOne({
      email: req.body.email
    },
      {
        $set: {
          otp: otp
        }
      }
    )
    console.log("DATA", data)
    return res.status(200).send({
      statusCode: 200,
      message: "Otp resend successfully",
    })
  } catch (error) {
    res.status(400).send({ message: "FAILED" })
  }
})

// FOR VERIFYING OTP MATCHES
router.post('/checkOtp', async (req, res, next) => {
  try {
    let data = req.body
    let dbData = await Users.findOne({ email: data.email });
    console.log("data", data);
    console.log("dbData", dbData);
    if (dbData.otp == data.otp) {
      res.status(202).send({ message: "OTP MATCHED" })
    }
    else {
      res.status(403).send({ message: "OTP NOT MATCHED" })
    }
  } catch (error) {
    res.status(500).send({ message: "INTERNAL SERVER ERROR" })
  }
})

// FOR CHANGING PASSWORD 
router.put('/changePassword', async (req, res, next) => {
  try {
    let { email, password } = req.body;

    let changepass = await Users.updateOne({ email: email }, { $set: { password: password } })
    if (changepass) {
      res.status(200).send({ message: "PASSWORD UPDATED" })
    }
    else {
      res.status(200).send({ message: "PASSWORD NOT UPDATED" })
    }
  }

  catch (error) {
    res.status(500).send({ message: "ERROR" })
  }
})

// FOR LOGOUT 
router.put('/logout', auth, async (req, res, next) => {
  try {
    const token = req.headers.authorization
    let data = await Users.updateOne({
      accessToken: token
    },
      {
        $set: {
          accessToken: ""
        }
      }
    )
    res.send({ message: data })
  } catch (error) {
    res.send({ message: "ERROR" })
  }
})



module.exports = router;
