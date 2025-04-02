const Router=require("express").Router()
const {createUser,login,veriyfyUser,forgetPassword,resetPassword,updateUser,findUserById,findUserByEmail}=require("../controller/userController")
const {getBookingDataOfUser}=require("../controller/bookingController")
const{checkJwt}=require("../controller/adminController")


Router.route("/create-user").post(createUser)
Router.route("/get-user/:userId").get(checkJwt,findUserById)
Router.route("/get-user").get(checkJwt,findUserByEmail)
Router.route("/login").post(login)
Router.route("/verify-user").post(veriyfyUser)
Router.route("/get-booking-data").get(checkJwt,getBookingDataOfUser)
Router.route("/update-user").patch(checkJwt,updateUser)
Router.route("/forget-password").post(forgetPassword)
Router.route("/reset-password/:code").patch(resetPassword)







module.exports=Router