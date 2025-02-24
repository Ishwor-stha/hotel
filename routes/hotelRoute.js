const Router=require("express").Router()
const {createHotel}=require("../controller/hotelController")



Router.route("/create-hotel").post(createHotel)


module.exports=Router