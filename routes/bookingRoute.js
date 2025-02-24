const express = require("express");
const Router = express.Router();
const {checkJwt}=require("../controller/adminController")
const { chooseHotel, chooseRoom , book } = require("../controller/bookingController");


Router.route("/choose-hotel").post(checkJwt,chooseHotel);
Router.route("/choose-room").post(checkJwt,chooseRoom);

// Router.route("/payment-details").post(paymentDetails);
Router.route("/book").post(checkJwt,book);

module.exports = Router;
