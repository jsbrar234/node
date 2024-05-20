const stripe = require("stripe")(
    "sk_test_51OyTpPL1Xbqrc9Wk80FsZ2rHYh0WKapfzeTZwMvwI4ZYgcd37OGoq1nNDp4yhA4aq3ilb2cFgwktMgvJlUsJFS3w00szOqS5KG"
  );
  const Publishable_key = require("stripe")(
    "pk_test_51OyTpPL1Xbqrc9WkrYbyZXXk84jn5y2CoygXNIA3lGcmv0K7rvmcIdzurTZO2XGfVgV7LaiEwZuFF1KZLDHDX9ab00blrGae9v"
  );
  const onboardmodel = require("../model/accountOnboard.model");
  const bcrypt = require("bcrypt");
   
  const dotenv = require("dotenv");
  dotenv.config();
  const auth = {};
  auth.createAccount = async (req, res) => {
    try {
      const data = req.body;
      const user = await onboardmodel.findOne({ email: data.email });
      if (user) {
        res.status(400).json({
          success: false,
          message: "user already exist",
        });
      } else {
        const hash = await bcrypt.hash(
          data.password,
          parseInt(process.env.SALT_ROUND)
        );
        data.password = hash;
  
        const account = await stripe.accounts.create({
          type: "custom",
          country: "US",
          email: data.email,
          capabilities: {
            card_payments: {
              requested: true,
            },
            transfers: {
              requested: true,
            },
          },
        });
        if (account) {
          res.status(200).json({
            success: true,
            message: "account created successfully",
            data: account,
          });
        }
        const saveRecord = await onboardmodel.create(data);
        if (saveRecord) {
          res.status(200).json({
            success: true,
            message: "signup successfully",
            data: saveRecord,
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        success: true,
        message: "internal server error",
        error: error.message,
      });
    }
  };
  auth.createaccountLink = async (req, res) => {
    try {
      const { accountId } = req.body;
  
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: "https://example.com/reauth",
        return_url: "https://example.com/return",
        type: "account_onboarding",
      });
      if (accountLink) {
        res.status(200).json({
          success: true,
          message: "account created successfully",
          data: accountLink,
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
  auth.createBankToken = async (req, res) => {
    try {
      const data = req.body;
      const token = await stripe.tokens.create({
        bank_account: {
          country: data.country,
          currency: data.currency,
          account_holder_name: data.account_holder_name,
          account_holder_type: data.account_holder_type,
          routing_number: data.routing_number,
          account_number: data.account_number,
        },
      });
  
      res.status(200).json({
        success: true,
        message: "Bank account token created successfully",
        token: token.id,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "internal server error",
        error: error.message,
      });
    }
  };
  //external bank account
  auth.createBankAccount = async (req, res) => {
    try {
      const data = req.body;
      accountId = data.accountId;
      const externalAccount = await stripe.accounts.createExternalAccount(
        accountId,
        {
          external_account: data.external_account,
        }
      );
      if (externalAccount) {
        res.status(200).json({
          success: true,
          message: "account created successfully",
          data: externalAccount,
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
  auth.updateBankAccount = async (req, res) => {
      try {
          const { accountId, bankAccountId } = req.body;
          
      
          const updatedExternalAccount = await stripe.accounts.updateExternalAccount(
              accountId,
              bankAccountId,
              {
                  metadata: {
                      order_id: '6735',
                  },
                  //it used to make bank account default
                  default_for_currency: true
               
              }
              
          );
  
          if (updatedExternalAccount) {
              res.status(200).json({
                  success: true,
                  message: 'Bank account updated successfully',
                  data: updatedExternalAccount
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
  
  auth.getExternalBankAccountList = async (req, res) => {
      try {
          const { accountId } = req.body;
  
          const externalAccounts = await stripe.accounts.listExternalAccounts(
              accountId,
              {
                  object: 'bank_account',
              }
          );
  
       
          if (externalAccounts && externalAccounts.data.length > 0) {
              
              const bankAccounts = externalAccounts.data.map(account => {
                  return {
                      id: account.id,
                      country: account.country,
                      currency: account.currency,
                      accountHolderName: account.account_holder_name,
                      last4: account.last4,
                      isDefault: account.default_for_currency,
                    
                  };
              });
  
              res.status(200).json({
                  success: true,
                  message: 'Bank accounts retrieved successfully',
                  data: bankAccounts
              });
          } else {
              res.status(404).json({
                  success: false,
                  message: 'No external accounts found'
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
  
  
  module.exports = auth;
  
  