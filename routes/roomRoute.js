const Router=require("express").Router();
const {createRoom}=require("../controller/roomController")
Router.route("/create-room").post(createRoom)


module.exports=Router