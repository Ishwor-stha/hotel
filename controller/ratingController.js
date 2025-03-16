const errorHandling = require("../utils/errorHandling")
const { connection } = require("../db")
module.exports.uploadRating = async (req, res, next) => {
	try {
		if (req.user.role !== "user") return next(new errorHandling(401, "You are not authorized to perform this task."))
		const userId = req.user.id
		const { hotelId, score, reviewMessage } = req.body
		if (!userId) return next(new errorHandling(400, "user id is missing."))
		if (!hotelId) return next(new errorHandling(400, "Hotel id is missing."))
		if (!score || !String(score).trim() || !reviewMessage || !reviewMessage.trim()) return next(new errorHandling(400, "Score or review message is missing.Please check again."))
		if (score > 5 && score < 0) return next(new errorHandling(400, "Invalid score number.Please Please make sure your score is in(0-5)"))
		//fetch the data to check if the user has already review 
		const [check] = await connection.promise().query(`SELECT reviewMessage FROM ratings WHERE hotel_id=? AND user_id=?`, [hotelId, userId])
		if (check.length !== 0) return next(new errorHandling(400, "You have already reviewd this hotel."))
		const query = `INSERT INTO ratings (user_id,hotel_id,score,reviewMessage) VALUES(?,?,?,?)`

		const uploadReview = await connection.promise().query(query, [userId, hotelId, score, reviewMessage])

		if (uploadReview[0]["affectedRows"] === 0) return next(new errorHandling(500, "Cannot upload the review.Please try again later."))
		res.status(200).json({
			status: true,
			message: "Review upload sucessfully"
		})
	} catch (error) {
		return next(new errorHandling(error.statusCode || 500, error.message))
	}
}

module.exports.updateRating = async (req, res, next) => {
	try {
		if (req.user.role !== "user") return next(new errorHandling(401, "You are not authorized to perform this task."))
		if (Object.keys(req.body).length === 0) return next(new errorHandling(400, "Cannot send empty body."))
		const userId = req.user.id
		const hotelId = req.body.hotelId
		const possibleFields = ["score", "reviewMessage"]
		const check = Object.keys(req.body).filter(field => possibleFields.includes(field) && req.body[field].trim())
		if (!userId) return next(new errorHandling(400, "Something went wrong."))
		if (!hotelId) return next(new errorHandling(400, "Cannot get hotel id."))
		if (check.length === 0) return next(new errorHandling(400, "Cannot update the ratings."))
		const values = []
		const fieldName = check.map(field => {
			values.push(req.body[field])
			return `${field}=?`
		})
		fieldName.push("updated_at=?")
        values.push(mysql.raw("CURRENT_TIMESTAMP"))
		const updateQuery = `UPDATE ratings SET ${fieldName.join(',')} WHERE user_id = ? AND hotel_id = ?`

		const updateRating = await connection.promise().query(updateQuery, [values, userId, hotelId])
		if (updateRating[0]["affectedRows"] === 0) return next(new errorHandling(500, "Cannot update the review.Please try again later."))

		res.status(200).json({
			status: true,
			message: "Review updated sucessfully"
		})
	} catch (error) {
		return next(new errorHandling(error.statusCode || 500, error.message))
	}
}

module.exports.getRating = async (req, res, next) => {
	try {

		if (req.user.role !== "user") return next(new errorHandling(401, "You are not authorized to perform this task."))
		const userId = req.user.id
		const hotelId = req.body.hotelId
		if (!userId) return next(new errorHandling(400, "Something went wrong."))
		if (!hotelId) return next(new errorHandling(400, "Cannot get hotel id."))
		const query = `SELECT score,reviewMessage FROM ratings WHERE user_id=? AND hotel_id=?`
		const [rating] = await connection.promise().query(query, [userId, hotelId])
		if (rating.length == 0) return next(new errorHandling(400, "Cannot get rating details."))
		res.status(200).json({
			status: true,
			message: "Rating fetched sucessfully",
			data: rating[0]
		})
	} catch (error) {
		return next(new errorHandling(error.statusCode || 500, error.message))

	}
}
module.exports.getRatings = async (req, res, next) => {
	try {

		const hotelId = req.body.hotelId
		if (!hotelId) return next(new errorHandling(400, "Cannot get hotel id."))
		const query = `SELECT score,reviewMessage FROM ratings WHERE hotel_id=?`
		const [rating] = await connection.promise().query(query, [hotelId])
		if (rating.length == 0) return next(new errorHandling(400, "Cannot get rating details."))
		res.status(200).json({
			status: true,
			total: rating[0].length,
			message: "Rating fetched sucessfully",
			data: rating[0]
		})
	} catch (error) {
		return next(new errorHandling(error.statusCode || 500, error.message))

	}
}
module.exports.deleteRating = async (req, res, next) => {
	try {

		if (req.user.role !== "user") return next(new errorHandling(401, "You are not authorized to perform this task."))
		const userId = req.user.id
		const hotelId = req.body.hotelId
		if (!userId) return next(new errorHandling(400, "Something went wrong."))
		if (!hotelId) return next(new errorHandling(400, "Cannot get hotel id."))
		const query = `DELETE FROM ratings WHERE user_id=? AND hotel_id=?`
		const rating = await connection.promise().query(query, [userId, hotelId])
		if (rating[0]["affectedRows"] === 0) return next(new errorHandling(500, "Cannot delete the rating.Please try again later."))
		res.status(200).json({
			status: true,
			message: "Rating deleted sucessfully",
		})
	} catch (error) {
		return next(new errorHandling(error.statusCode || 500, error.message))

	}
}