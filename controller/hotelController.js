const { connection, connect } = require("../db");
const errorHandling = require("../utils/errorHandling");
const mysql=require("mysql2")


module.exports.createHotel = async (req, res, next) => {
	try {
		if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You donot have enough permission to perform this task."));
		const possibleFields = ["name", "description", "image", "location"]

		const checkFields = possibleFields.filter(field => !Object.keys(req.body).includes(field) || !req.body[field])

		if (checkFields.length !== 0) return next(new errorHandling(400, `${checkFields}${checkFields.length > 1 ? "are" : "is"} missing please fill out all the fields.`));
		let questionMark = ""
		for (let i = 0; i < possibleFields.length; i++) {
			if (i === possibleFields.length - 1) questionMark += `?`
			else questionMark += `?,`
		}
		// console.log(questionMark) 
		const query = `INSERT INTO hotels (${possibleFields.join(",")}) VALUES(${questionMark})`
		const values = possibleFields.map(field => req.body[field]);
		const upload = await connection.promise().query(query, values);
		if (!upload) return next(new errorHandling(500, "Cannot create hotel please try again later."))
		res.status(200).json({
			status: true,
			message: "Congratulations,Hotel created sucessfully,"
		})
	} catch (error) {

		return next(new errorHandling(error.statusCode || 500, error.message))

	}

}


module.exports.updateHotel = async (req, res, next) => {
	try {
		if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You donot have enough permission to perform this task."));

		const id = req.params.id
		if (!id) return next(new errorHandling(400, "No id is given for hotel"));
		if (isNaN(Number(id))) return next(new errorHandling(400, "Hotel id must be a number."));
		if(!req.body || Object.keys(req.body).length===0)return next(new errorHandling(400,"Empty body is given."))
		const possibleFields = ["name", "description", "image", "location"]
		let valueFields = []
		const bodyField = Object.keys(req.body).map((field) => {
			if (possibleFields.includes(field)) {
				valueFields.push(req.body[field])
				return `${field}=?`
			}
		})
		

		// console.log(fieldName);
		// console.log(value)
		bodyField.push("updated_at=?")
		valueFields.push(mysql.raw("CURRENT_TIMESTAMP"))
		valueFields.push(id)
		const fieldName = bodyField.join(",")
		const query = `UPDATE hotels SET ${fieldName} WHERE id =?`
		const update = await connection.promise().query(query, valueFields);
		if (update[0]["affectedRows"] === 0) return next(new errorHandling(500, "Cannot update the details please check the id or details."))
		// console.log(update);
		res.status(200).json({
			status: true,
			message: "Updated sucessfully"
		})

	} catch (error) {
		return next(new errorHandling(error.statusCode || 500, error.message));
	}
}

module.exports.deleteHotel = async (req, res, next) => {
	try {
		if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You donot have enough permission to perform this task."));
		const id = req.params.id.trim();
		if (!id) return next(new errorHandling(400, "No id is given for hotel"));
		if (isNaN(Number(id))) return next(new errorHandling(400, "Hotel id must be a number."));
		const query = `DELETE FROM hotels WHERE id=?`
		const [deleteHotel] = await connection.promise().execute(query, [id]);
		if (deleteHotel["affectedRows"] === 0) return next(new errorHandling(404, "Cannot delete hotel please enter valid id."))
		res.status(200).json({
			status: true,
			message: "Hotel deleted sucessfully"
		})
	} catch (error) {

		return next(new errorHandling(error.statusCode || 500, error.message))
	}
}

module.exports.getAllHotels = async (req, res, next) => {
	try {
		const query = `SELECT * FROM hotels`
		const [hotels] = await connection.promise().query(query);
		if (!hotels || hotels.length === 0) return next(new errorHandling(404, "Cannot find hotel."));
		res.status(200).json({
			status: true,
			message: "Hotels fetched sucessfully.",
			data: hotels
		})

	} catch (error) {
		next(new errorHandling(error.statusCode || 500, "error"))
	}
}

module.exports.findHotelByID = async (req, res, next) => {
	try {
		const hotelId = req.params.hotelId.trim();
		if (!hotelId) return next(new errorHandling(400, "Invalid hotel id given. "));
		if (isNaN(Number(hotelId))) return next(new errorHandling(400, "Invalid hotel id is given."));
		const query = `SELECT * FROM hotels WHERE id=?`
		const [getHotelData] = await connection.promise().query(query, [hotelId]);
		if (!getHotelData || getHotelData.length === 0) return next(new errorHandling(404, "Cannot find hotel from given id."));
		res.status(200).json({
			status: true,
			message: "Hotel fetched sucessfully.",
			data: getHotelData
		})

	} catch (error) {
		return next(new errorHandling(error.statusCode || 500, error.message));

	}
}
