const Router=require("express").Router()
const {getAll,createAdmin,login,checkJwt,getOneAdmin,forgetPassowrd,resetPassword}=require("../controller/adminController")
Router.route("/get").get(checkJwt,getAll)
Router.route("/get-one-admin/:id").get(checkJwt,getOneAdmin)
Router.route("/create-admin").post(checkJwt,createAdmin)
Router.route("/forget-password").post(forgetPassowrd)
Router.route("/login").post(login)
Router.route("/reset-password/:code").post(resetPassword)



module.exports=Router