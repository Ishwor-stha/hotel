const Router=require("express").Router()
const {createUser}=require("../controller/userController")

Router.route("/create-user").post(createUser)



module.exports=Router