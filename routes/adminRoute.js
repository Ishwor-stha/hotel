const Router=require("express").Router()
const {getAll}=require("../controller/adminController")
Router.route("/get").get(getAll)

module.exports=Router