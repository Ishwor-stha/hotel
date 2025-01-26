const Router=require("express").Router()
const {getAll,createAdmin,login,logout,checkJwt}=require("../controller/adminController")
Router.route("/get").get(checkJwt,getAll)
Router.route("/create-admin").post(checkJwt,createAdmin)
Router.route("/login").post(login)
Router.route("/logout").post(checkJwt,logout)


module.exports=Router