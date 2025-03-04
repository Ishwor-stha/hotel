const Router=require("express").Router()
const {uploadRating,updateRating}=require("../controller/ratingController")
const {checkJwt}=require("../controller/adminController")


Router.route("/get-rating").post(checkJwt,uploadRating)
Router.route("/update-rating").patch(checkJwt,updateRating)




module.exports=Router