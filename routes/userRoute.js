const Router=require("express").Router()
const {createUser,login}=require("../controller/userController")
const {chooseHotel,chooseRoom,paymentDetails}=require("../controller/bookingController")



Router.route("/hotel").post(chooseHotel)
Router.route("/room").post(chooseRoom)
Router.route("/create-user").post(createUser)
Router.route("/login").post(login)
Router.route("/details").post(paymentDetails)





module.exports=Router