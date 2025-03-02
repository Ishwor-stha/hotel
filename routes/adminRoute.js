const Router=require("express").Router()
const {getAll,createAdmin,updateAdmin,login,checkJwt,getOneAdmin,forgetPassword,resetPassword}=require("../controller/adminController")
const{getBookingDataForAdmin}=require("../controller/bookingController")
Router.route("/get").get(checkJwt,getAll)
Router.route("/get-one-admin/:id").get(checkJwt,getOneAdmin)
Router.route("/create-admin").post(checkJwt,createAdmin)
Router.route("update-admin").patch(checkJwt,updateAdmin)
Router.route("/login").post(login)
Router.route("/forget-password").post(forgetPassword)
Router.route("/reset-password/:code").patch(resetPassword)

////get booking 
Router.route("/get-booking-data").post(checkJwt,getBookingDataForAdmin)



module.exports=Router