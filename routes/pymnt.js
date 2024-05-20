const cardStripe = require("../model/user.model");
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
// const { router } = require("../../app");
dotenv.config()
const stripe = require("stripe")(process.env.Secret_key);
const Publishable_key = require("stripe")(process.env.Publishable_key);



const auth = {};

auth.register = async (req, res) => {
  try {
    const data = req.body;
    const isExist = await cardStripe.findOne({ email: data.email });
    if (isExist) {
      res.status(400).json({
        success: false,
        message: "account already exist with this email",
      });
    } else {
      const hash = await bcrypt.hash(
        data.password,
        parseInt(process.env.salt_round)
      );
      data.password = hash;

      const customer = await stripe.customers.create({
        name: data.username,
        email: data.email,
      });
      data.customerId = customer.id;
      const saveRecord = await cardStripe.create(data)

      if (saveRecord) {
        res.status(200).json({
          success: true,
          message: 'Account created successfully',
          data: saveRecord,
        })

      }
    }
  } catch (err) {
    res.status(500).json({
      success: 500,
      message: 'internal server error',
      error: err.message
    })
  }
};

auth.createpaymentMethod = async (req, res, next) => {
  try {
    const {
      Customer_Id,
      Card_Name,
      Card_ExpYear,
      Card_ExpMonth,
      Card_Number,
      Card_CVC,
    } = req.body;



    const cardToken = await Publishable_key.tokens.create({
      card: {
        name: Card_Name,
        number: Card_Number,
        exp_month: Card_ExpMonth,
        exp_year: Card_ExpYear,
        cvc: Card_CVC,
      },
    });

    console.log("--->>>>", cardToken);




    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: cardToken.id },
    });


    const attachedPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethod.id,
      { customer: Customer_Id }
    );
    res.status(200).json({ success: true, card: attachedPaymentMethod });
  } catch (error) {
    console.log("error", error);
  }
};
//payment intent api
auth.createCharges = async (req, res) => {
  try {
    const { Customer_Id, card_Id, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      customer: Customer_Id,
      payment_method: card_Id,
      confirm: true,
      return_url: "https://api.stripe.com/v1/tokens",
    });

    if (paymentIntent) {
      res.status(200).send({
        success: true,
        message: "Payment done successfully",
        data: paymentIntent,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Payment not done",
        data: userData,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'internal server error',
      error: error.message
    })
  }
}
auth.getList = async (req, res) => {
  try {
    const customer_Id = req.query.customer_Id;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer_Id,
      type: "card",
      limit: 3,
    });

    let data = [];

    for (let index = 0; index < paymentMethods.data.length; index++) {
      const element = paymentMethods.data[index];
      data.push({
        card_details: element.card.brand,
        last4: element.card.last4,

      });
    }

    res.status(200).json({
      success: true,
      message: "Card list found",
      data: data,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


auth.refundApi = async (req, res) => {
  try {
    const { chargeId } = req.body;

    const refund = await stripe.refunds.create({
      charge: chargeId,
    });

    if (refund) {
      return res.status(200).json({
        success: true,
        message: 'Refund successfully processed',
        data: refund
      });
    }
  } catch (error) {

    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
auth.getRefundList = async (req, res) => {
  try {
    const chargeId = req.query.chargeId;

    if (!chargeId) {
      return res.status(400).json({
        success: false,
        message: 'Charge ID is required in the query parameters'
      });
    }

    const refunds = await stripe.refunds.list({
      charge: chargeId,
      limit: 3,
    });

    res.status(200).json({
      success: true,
      message: 'Refund list retrieved successfully',
      data: refunds
    });
  } catch (error) {
    console.error('Error retrieving refunds:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
auth.createPrice = async (req, res) => {
  try {
    const { productName, unitAmount } = req.body;

    if (!productName || !unitAmount) {
      return res.status(400).json({
        success: false,
        message: 'productName and unitAmount are required',
      });
    }

    const price = await stripe.prices.create({
      product_data: {
        name: productName,
        type: 'service',
      },
      unit_amount: unitAmount,
      currency: 'usd',
    });

    if (price) {
      return res.status(200).json({
        success: true,
        message: 'Price created successfully',
        data: price
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


auth.paymentLink = async (req, res) => {
  try {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: 'price_1Oyr2zL1Xbqrc9WksWUMrSR2',
          quantity: 1,
        },
      ],
    });
    if (paymentLink) {
      res.status(200).json({
        success: true,
        message: 'payment link generated successfully',
        data: paymentLink
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'internal server error',
      error: error.message
    })
  }
}
module.exports = auth;