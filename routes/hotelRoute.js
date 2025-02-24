const Router=require("express").Router()
const {createHotel,updateHotel}=require("../controller/hotelController")



Router.route("/create-hotel").post(createHotel)
Router.route("/update-hotel/:id").patch(updateHotel)


module.exports=Router