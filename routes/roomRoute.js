const Router=require("express").Router();
const {createRoom}=require("../controller/roomController")
Router.route("/create-room").get(createRoom)

module.exports=Router