const Router=require("express").Router();
const {createRoom,updateRoom}=require("../controller/roomController")
const {checkJwt}=require("../controller/adminController")
Router.route("/create-room").post(checkJwt,createRoom)

Router.route("/update-room/:roomId").patch(checkJwt,updateRoom)

module.exports=Router