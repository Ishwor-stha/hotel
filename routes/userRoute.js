const Router=require("express").Router()
const {createUser,login}=require("../controller/userController")



Router.route("/create-user").post(createUser)
Router.route("/login").post(login)
// Router.route("/details").post(paymentDetails)





module.exports=Router