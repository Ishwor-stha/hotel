const { connection, connect } = require("../db");
const errorHandling = require("../utils/errorHandling");


module.exports.createHotel=async(req,res,next)=>{
	try{
		if(req.user.role!==process.env.arole)return next(new errorHandling(401,"You donot have enough permission to perform this task."));
		const possibleFields=["name","description","image","location"]

		const checkFields=possibleFields.filter(field=> !Object.keys(req.body).includes(field) || !req.body[field])

		if(checkFields.length!==0)return next(new errorHandling(400,`${checkFields}${checkFields.length>1?"are":"is"} missing please fill out all the fields.`));
		let questionMark=""
		for(let i=0;i<possibleFields.length;i++){
			if(i===possibleFields.length-1)questionMark+=`?`
			else questionMark+=`?,`
		}
		// console.log(questionMark) 
		const query=`INSERT INTO hotels (${possibleFields.join(",")}) VALUES(${questionMark})`
		const values=possibleFields.map(field=> req.body[field]);
		const upload =await connection.promise().query(query,values);
		if(!upload)return next(new errorHandling(500,"Cannot create hotel please try again later."))		 
		res.status(200).json({
			status:true,
			message:"Congratulations,Hotel created sucessfully,"
		})
	}catch(error){

		return next(new errorHandling(error.statusCode || 500,error.message))

	}

}


module.exports.updateHotel=async (req,res,next)=>{
	try{
		if(req.user.role!==process.env.arole)return next(new errorHandling(401,"You donot have enough permission to perform this task."));

		const id=req.params.id.trim()
		if(!id)return next(new errorHandling(400,"No id is given for hotel"));
		if(isNaN(Number(id)))return next(new errorHandling(400,"Hotel id must be a number."));
		const possibleFields=["name","description","image","location"]
		let valueFields=[]
		const bodyField=Object.keys(req.body).map((field)=>{
			if(possibleFields.includes(field)){
				valueFields.push(field)
				return `${field}=?` 
			}
		})
		const value=valueFields.map(field=>req.body[field])

		const fieldName=bodyField.join(",")
		// console.log(fieldName);
		// console.log(value)
		const query=`UPDATE hotels SET ${fieldName} WHERE id =${id}`
		const update=await connection.promise().query(query,value);
		if(update[0]["affectedRows"]===0 )return next(new errorHandling(500,"Cannot update the details please check the id or details."))
		// console.log(update);
		res.status(200).json({
			status:true,
			message:"Updated sucessfully"
		})

	}catch(error){
		return next(new errorHandling(error.statusCode ||500,error.message));
	}
}

module.exports.deleteHotel=async(req,res,next)=>{
	try{
		if(req.user.role!==process.env.arole)return next(new errorHandling(401,"You donot have enough permission to perform this task."));
		const id=req.params.id.trim();
		if(!id)return next(new errorHandling(400,"No id is given for hotel"));
		if(isNaN(Number(id)))return next(new errorHandling(400,"Hotel id must be a number."));
		const query=`DELETE FROM hotels WHERE id=?`
		const [deleteHotel]=await connection.promise().execute(query,[id]);
		if(deleteHotel["affectedRows"]===0)return next (new errorHandling(404,"Cannot delete hotel please enter valid id."))
		res.status(200).json({
			status:true,
			message:"Hotel deleted sucessfully"
		})
	}catch(error){

		return next(new errorHandling(error.statusCode||500 ,error.message))
	}
}
