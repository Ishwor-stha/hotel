const Router=require("express").Router()
const {getAll,createAdmin,login}=require("../controller/adminController")
Router.route("/get").get(getAll)
Router.route("/create-admin").post(createAdmin)
Router.route("/login").post(login)

module.exports=Router