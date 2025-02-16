const { logout } = require("../controller/logout")
const {checkJwt}=require("../controller/adminController")

const Router=require("express").Router()

Router.route("/logout").delete(checkJwt, logout)

module.exports=Router