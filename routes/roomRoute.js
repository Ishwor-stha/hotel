const Router=require("express").Router();
const {createRoom,updateRoom,getAllRooms,getRoomById}=require("../controller/roomController")
const {checkJwt}=require("../controller/adminController")
Router.route("/create-room").post(checkJwt,createRoom)

Router.route("/update-room/:roomId").patch(checkJwt,updateRoom)

Router.route("/get-rooms").get(getAllRooms)

Router.route("/get-room/:roomId").get(getRoomById)

module.exports=Router