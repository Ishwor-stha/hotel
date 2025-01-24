const Router=require("express").Router()
const {getAll,createAdmin}=require("../controller/adminController")
Router.route("/get").get(getAll)
Router.route("/create-admin").post(createAdmin)

module.exports=Router