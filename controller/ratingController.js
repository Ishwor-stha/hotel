const errorHandling=require("../utils/errorHandling")
const {connection}=require("../db")
module.exports.uploadRating=async(req,res,next)=>{
	try{
		if(req.user.role !=="user") return next(new errorHandling(401,"You are not authorized to perform this task."))
		const userId=req.user.id
		const {hotelId,score,reviewMessage}=req.body
		if(!userId)return next(new errorHandling(400,"user id is missing."))
		if(!hotelId)return next(new errorHandling(400,"Hotel id is missing."))
		if(!score || !String(score).trim() || !reviewMessage || !reviewMessage.trim())return next(new errorHandling(400,"Score or review message is missing.Please check again."))
		if(score > 5 && score <0)return next(new errorHandling(400,"Invalid score number.Please Please make sure your score is in(0-5)"))
		//fetch the data to check if the user has already review 
		const [check]=await connection.promise().query(`SELECT reviewMessage FROM ratings WHERE hotel_id=? AND user_id=?`,[hotelId,userId])
		if(check.length !==0)return next(new errorHandling(400,"You have already reviewd this hotel."))
		const query=`INSERT INTO ratings (user_id,hotel_id,score,reviewMessage) VALUES(?,?,?,?)`

		const uploadReview=await connection.promise().query(query,[userId,hotelId,score,reviewMessage])
    	
        if(uploadReview[0]["affectedRows"]===0)return next(new errorHandling(500,"Cannot upload the review.Please try again later."))
        res.status(200).json({
        	status:true,
        	message:"Review upload sucessfully"
        })
	}catch(error){
		return next(new errorHandling(error.statusCode|| 500,error.message))
	}
}

module.exports.updateRating