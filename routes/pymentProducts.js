const subModel = require("../model/alsubcription.model");
const stripe = require("stripe")(process.env.Secret_key);
const Publishable_key = require("stripe")(process.env.Publishable_key);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const submodel = require("../model/alsubcription.model");
const cardStripe = require("../model/user.model");
dotenv.config();

const userSignupnew = async (req, res) => {
  try {
    const data = req.body;
    const user = await submodel.findOne({ email: data.email });
    if (user) {
      res.status(200).json({
        success: false,
        message: "user already exist please login",
      });
    } else {
      const hash = await bcrypt.hash(
        data.password,
        parseInt(process.env.salt_round)
      );
      data.password = hash;
      const customer = await stripe.customers.create({
        name: "rohal singh",
        email: "jennyrosen@example.com",
      });
      data.customer_id = customer.id;
      const saveData = await subModel.create(data);
      if (saveData) {
        res.status(200).json({
          success: true,
          message: "signup successfully",
          data: saveData,
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};
const userLogin = async (req, res) => {
  try {
    const data = req.body;
    const user = await subModel.findOne({ email: data.email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "user not found",
      });
    } else {
      const comparePassword = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!comparePassword) {
        res.status(400).json({
          success: false,
          message: "invalid credentials",
          error: error.message,
        });
      } else {
        const payload = {
          id: user._id,
          email: user.email,
        };
        const token = await jwt.sign(payload, process.env.jwt_secret);
        if (token) {
          res.status(200).json({
            success: false,
            message: "login successfully",
            data: data,
            token,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

const createPaymentMethod = async (req,res)=>{
  try {
    const {
      customer_id,
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
     
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: cardToken.id },
    });


    const attachedPaymentMethod = await stripe.paymentMethods.attach(
      paymentMethod.id,
      { customer: customer_id }
    );
    res.status(200).json({
       success: true, 
       card: attachedPaymentMethod });

  } catch (error) {
    res.status(500).json({
      success:false,
      message:'internal server error',
      error:error.message
    })
  }
}
//it helps setting default payment method first you have to hit this api
const retriveCustomer = async (req,res)=>{
  try {
    const customer = await stripe.customers.retrieve('cus_Ptj7YOIsOktmaN');
    if(customer){
      res.status(200).json({
        success:true,
        message:'customer retrive successfully',
        data:customer
      })
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:'internal server error',
      error:error.message
    })
  }
}

// here we set default payment method every customer have multiple payment options
//using uspadate customer 
const updateCustomer = async (req, res) => {
  try {
   
    const data = req.body
    const customerId = data.customerId; 
    const newPaymentMethodId = data.paymentMethodId; 

    const customer = await stripe.customers.update(
      customerId,
      {
        invoice_settings: {
          default_payment_method: newPaymentMethodId
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Customer information updated successfully',
      customer: customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

const createProduct = async (req, res) => {
  try {
    const data = req.body;
    const product = await stripe.products.create({
      name: data.product_name,
    });
    if (product) {
      res.status(200).json({
        success: true,
        message: "product created successfully",
        data: product,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "internal server error",
      error: error.message,
    });
  }
};

const createPrice = async (req, res) => {
  try {
    const data = req.body;

    if (!data.productName || !data.unitAmount || !data.currency || !data.product_id) {
      return res.status(400).json({
        success: false,
        message: "productName, unitAmount, currency, and product_id are required",
      });
    }
   
    const price = await stripe.prices.create({
      currency: data.currency,
      unit_amount: data.unitAmount,
      product: data.product_id,
      recurring: {
        interval: "month"
      }, 
      type: 'recurring' 
    });

    res.status(200).json({
      success: true,
      message: "Price created successfully.",
      data: price,
    });
  } catch (error) {
    console.error("Error creating price:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message
    });
  }
};

// in payment method update payment then set default payment method from multiple card

const createSubscription = async (req, res) => {
  try {
    const data = req.body;

    if (!data.customer_id || !data.price) {
      return res.status(400).json({
        success: false,
        message: "customer_id and price are required",
      });
    }

    const subscription = await stripe.subscriptions.create({
      
      customer: data.customer_id,

      items: [
        {
          price: data.price,
        },
      ],
    
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'] 

    });

    return res.status(200).json({
      success: true,
      message: "Subscription created successfully.",
      data: subscription,
    });
  } catch (error) {
    
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message
    });
  }
};




module.exports = {
  userSignupnew,
  userLogin,
  createPaymentMethod,
  retriveCustomer,
  updateCustomer,
  createProduct,
  createPrice,
  createSubscription,
 
}