const Router=require("express").Router()
const {getAll,createAdmin,login,checkJwt,getOneAdmin}=require("../controller/adminController")
Router.route("/get").get(checkJwt,getAll)
Router.route("/get-one-admin/:id").get(checkJwt,getOneAdmin)
Router.route("/create-admin").post(checkJwt,createAdmin)
Router.route("/login").post(login)



module.exports=Router