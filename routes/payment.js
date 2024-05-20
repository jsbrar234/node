var express = require('express');
const { default: mongoose } = require('mongoose');
const { auth } = require("../middleware/auth");
var router = express.Router();

const Stripe = require('stripe');
const { Users } = require('../models/users');
const stripe = Stripe('sk_test_51P3Yj32M0zv9ALj1LHUwHkPPVTwDggLu4L3G9NVndZBqr3xEDF37B8r4xbxwyoZDVURLBJjSNxzGojaS8yOUpeNM00x63mhmWk');
const publicStripe = Stripe('pk_test_51P3Yj32M0zv9ALj1vJhswp1Wu2AaO4Blc5YMfrsIqMqsPkTkDsiSij1k2DVF2btIIIEAnBV2FPduHjurdwbe42va00ZdeIp7s9');

// FOR CHECKING BALANCE 

router.get("/check", async (req, res) => {

    const balance = await stripe.balance.retrieve();

    if (balance) {
        res.status(200).send({
            data: balance
        })
    }
    else {
        res.status(400).send({
            message: "data not found"
        })
    }
})

// GENERATE TOKEN FOR BANK OR CARD DETAILS 
// AND CREATE PAYMENT METHOD 
// AND ATTACH CUSTOMER AND PAYMENT METHOD

router.post("/createPaymentMethod", auth,  async (req, res) => {

    const userId = req.userId

    const data = await Users.findOne({
        _id : userId
    })

    if(data){
        try {
            const token = await publicStripe.tokens.create({
                card: {
                    number: req.body.card.number,
                    exp_month: req.body.card.month,
                    exp_year: req.body.card.year,
                    cvc: req.body.card.cvc,
                },
            });
    
    
            if (token) {
                const paymentMethod = await stripe.paymentMethods.create({
                    type: 'card',
                    card: {
                        token: token.id
                    },
                });
    
                if (paymentMethod) {
                    const attachPaymentMethod = await stripe.paymentMethods.attach(
                        paymentMethod.id,
                        {
                            customer: data.customerId,
                        }
                    );
    
                    if (attachPaymentMethod) {
                        res.status(200).send({
                            message: "ATTACHED",
                            TokenId: token.id,
                            paymentMethodId: paymentMethod.id
                        })
                    }
                    else {
                        console.log("Error")
                    }
                }
                else {
                    res.status(400).send({
                        message: "Error"
                    })
                }
            }
            else {
                res.status(400).send({
                    message: "Error"
                })
            }
        } catch (error) {
            console.log(error)
        }
    }
    else{
        res.status(400).send({
            message : "error adding payment method"
        })
    }
})

// GET CUSTOMER PAYMENT METHODS LIST

router.get("/getCustomerPaymentMethods", auth, async (req, res) => {

    try {
        const userId = req.userId;
    
        const data = await Users.findOne({
            _id: new mongoose.Types.ObjectId(userId)
        })
    
        if (data) {
            const paymentMethods = await stripe.customers.listPaymentMethods(
                data.customerId, {
            }
            );
    
            if (paymentMethods) {
                return res.status(200).send({
                    data: paymentMethods
                })
            }
            else {
                return res.status(400).send({
                    message: "ERROR"
                })
            }
        }
        else {
            res.status(400).send({
                message: "error getting payment methods"
            })
        }
    } catch (error) {
        res.status(500).send({
            message : "internal server error"
        })
    }
})

// MAKE PAYMENT

router.post("/makePayment", auth,  async (req, res) => {
    try {

        const data = await Users.findOne({
            _id : req.userId
        })
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            customer: data.customerId,
            payment_method: req.body.paymentMethodId,
            confirm: true,
            return_url: "https://api.stripe.com/v1/tokens",
        });

        res.status(200).send({
            success: true,
            message: "Payment done successfully",
            data: paymentIntent,
        });
    } catch (error) {
        console.error("Error while making payment:", error);
        res.status(400).send({
            success: false,
            message: "Payment not done",
            error: error.message, // Sending the error message back to the client
        });
    }
});

// REFUND API

router.post("/refund", async (req, res) => {
    try {
        const { chargeId, paymentIntent } = req.body;

        const refund = await stripe.refunds.create({
            charge: chargeId
        });

        console.log("REFUND REACHED")
        res.status(200).send({
            message: "Refund initiated successfully",
            data: refund
        });
    } catch (error) {
        console.error("Error while processing refund:", error);
        res.status(400).send({
            message: "Refund failed"
        });
    }
});

// MAKE DAEFAULT PAYMENT METHOD

router.post("/setDefaultCard", auth, async (req, res) => {
    try {
        const { paymentMethodId } = req.body;

        const userId = req.userId;

        const data = await Users.findOne({
            _id: new mongoose.Types.ObjectId(userId)
        })

        if (data) {
            // Update customer's default payment method
            await stripe.customers.update(data.customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            });

            res.status(200).send({
                message: "Default card updated successfully"
            });
        }
    } catch (error) {
        console.error("Error while updating default card:", error);
        res.status(400).send({
            message: "Failed to update default card"
        });
    }
})

// CHECK DEFAULT PAYMENT METHOD

router.post("/checkDefault", auth, async (req, res) => {
    const userId = req.userId

    const data = await Users.findOne({
        _id: new mongoose.Types.ObjectId(userId)
    })

    if (data) {
        const customer = await stripe.customers.retrieve(data.customerId);

        res.status(200).send({
            data: customer.invoice_settings.default_payment_method
        })

    }
    else{
        res.status(400).send({
            message : "error find default payment method"
        })
    }
})









module.exports = router


