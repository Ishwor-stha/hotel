const Router=require("express").Router()
const {uploadRating}=require("../controller/ratingController")
const {checkJwt}=require("../controller/adminController")


Router.route("/get-rating").post(checkJwt,uploadRating)




module.exports=Router