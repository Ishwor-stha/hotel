const express = require("express");
const Router = express.Router();
const {payWithEsewa,failure,success} = require("../controller/paymentController");


Router.route("/make-payment").post(payWithEsewa);
Router.route("/success").get(success);
Router.route("/failed").get(failure);


module.exports = Router;
