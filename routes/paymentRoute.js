const express = require("express");
const {checkJwt}=require("../controller/adminController")
const Router = express.Router();
const {payWithEsewa,failure,success} = require("../controller/paymentController");


Router.route("/make-payment").post(checkJwt,payWithEsewa);
Router.route("/success").get(checkJwt,success);
Router.route("/failed").get(checkJwt,failure);


module.exports = Router;
