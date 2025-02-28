const Router=require("express").Router()
const {createHotel,updateHotel,deleteHotel}=require("../controller/hotelController")
const {checkJwt}=require("../controller/adminController")

// console.log(require.resolve("../controller/adminController" ))


Router.route("/create-hotel").post(checkJwt,createHotel)
Router.route("/update-hotel/:id").patch(checkJwt,updateHotel)
Router.route("/delete-hotel/:id").delete(checkJwt,deleteHotel)



module.exports=Router