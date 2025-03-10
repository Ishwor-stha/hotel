const Router=require("express").Router()
const {uploadRating,updateRating,getRating,deleteRating,getRatings}=require("../controller/ratingController")
const {checkJwt}=require("../controller/adminController")


Router.route("/upload-rating").post(checkJwt,uploadRating)
Router.route("/update-rating").patch(checkJwt,updateRating)
Router.route("/get-rating").get(checkJwt,getRating)
Router.route("/get-ratings").get(getRatings)
Router.route("/delete-rating").delete(checkJwt,deleteRating)




module.exports=Router