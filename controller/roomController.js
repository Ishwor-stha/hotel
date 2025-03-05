const errorHandling = require("../utils/errorHandling");
const {
    connection
} = require("../db");
module.exports.createRoom = async (req, res, next) => {
    try {
        if(req.user.role!==process.env.arole)return next(new errorHandling(401,"You donot have enough permission to perform this task."));

    	if(!req.body ||Object.keys(req.body).length ===0)return next(new errorHandling(400,"Empty body please send data ."))
    	const possibleFields=["room_type","price_per_night","capacity","features","images"]
    	const checkFields=Object.keys(req.body).filter(field=> !possibleFields.includes(field) || !req.body[field] );
    	console.log(checkFields)
        if(checkFields.length!==0)return next(new errorHandling(400,`${checkFields} ${checkFields.length===1?"is":"are"} missing.Please fill out the all form.`));
        let  questionMark=[]
        const values=possibleFields.map(field=>{
        	questionMark.push("?")
        	return req.body[field]
        })

		const query=`INSERT INTO rooms(${possibleFields.join(",")} VALUES (${questionMark.join(",")})` //ie INSERT INTO rooms(room_type,price_per_night,capacity,features,images VALUES (?,?,?,?,?)

		const uploadRoomData=await connection.promise().query(query,values);
        if(uploadRoomData[0]["affectedRows"]===0)return next(new errorHandling(500,"Cannot upload the data.Please try again later."))

        res.status(200).json({
            status: true,
            message: "Room created sucessfully."
        })
    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }
}

module.exports.updateRoom=async (req, res, next)=>{
    try{
        if(req.user.role!==process.env.arole)return next(new errorHandling(401,"You donot have enough permission to perform this task."));
        const roomId=req.params.roomId
        if(!roomId ||roomId.trim() === "")return next (new errorHandling(400,"No room id is given to update."))

        if(!req.body ||Object.keys(req.body).length ===0)return next(new errorHandling(400,"Empty body please send data ."))
        const possibleFields=["room_type","price_per_night","capacity","features","images"]
        const checkFields=Object.keys(req.body).filter(field=> possibleFields.includes(field) || req.body[field] );
        if (checkFields.length ==0)return next(new errorHandling(400,"No data to update."))
        const values=[]
        const fieldName=checkFields.map(field=>{
            values.push(req.body[field])
            return `${field}=?`
        })
        // inserting the room id in values array

        values.push(roomId)
        console.log(values );
        // const updateQuery= `UPDATE rooms SET ${fieldName.join(',')} WHERE id=?`
        // const updateRoom=await connection.promise().query(updateQuery,values)
        res.status(200).json({
            status:true,
            message:"Room updated sucessfully."
        })
    }catch(error){
        return next(new errorHandling(error.statusCode || 500,error.message))
    }
}
