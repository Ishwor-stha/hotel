const Router=require("express").Router()
const {createUser,login,veriyfyUser,forgetPassword,resetPassword,updateUser}=require("../controller/userController")
const {getBookingDataOfUser}=require("../controller/bookingController")
const{checkJwt}=require("../controller/adminController")


Router.route("/create-user").post(createUser)
Router.route("/login").post(login)
Router.route("/verify-user").post(veriyfyUser)
Router.route("/get-booking-data").get(checkJwt,getBookingDataOfUser)
Router.route("/update-user").patch(checkJwt,updateUser)
Router.route("/forget-password").post(forgetPassword)
Router.route("/reset-password").patch(resetPassword)







module.exports=Router