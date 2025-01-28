const { logout } = require("../controller/logout")

const Router=require("express").Router()

Router.route("/logout").delete(logout)

module.exports=Router