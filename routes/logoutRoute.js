const Router=require("express").Router()
const { logout } = require("../controller/logout")
const {checkJwt}=require("../controller/adminController")


Router.route("/logout").delete(checkJwt, logout)

module.exports=Router