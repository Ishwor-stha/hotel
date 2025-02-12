const express = require("express");
const Router = express.Router();
const { chooseHotel, chooseRoom , book } = require("../controller/bookingController");


Router.route("/choose-hotel").post(chooseHotel);
Router.route("/choose-room").post(chooseRoom);
// Router.route("/payment-details").post(paymentDetails);
Router.route("/book").post(book);

module.exports = Router;
