const { connection, connect } = require("../db");
const errorHandling = require("../utils/errorHandling");


module.exports.createHotel=async(req,res,next)=>{
	try{
		const possibleFields=["name","description","image","location"]

		const checkFields=possibleFields.filter(field=> !Object.keys(req.body).includes(field) || !req.body[field])

		if(checkFields.length!==0)return next(new errorHandling(400,`${checkFields}${checkFields.length>1?"are":"is"} missing please fill out all the fields.`));

		 
		res.status(200).json({
			message:"this is the create hotel route"
		})
	}catch(error){

		return next(new errorHandling(error.statusCode || 500,error.message))

	}

}