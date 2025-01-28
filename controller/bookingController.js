const errorHandling = require("../utils/errorHandling")
const { connection } = require("../db")

module.exports.bookTour = async (req, res, next) => {
    try {
        if (!req.body) return next(new errorHandling(400, "All fields are required."))
        const { user_id, room_id, hotel_id, total_price, guests, check_out_date, check_in_date } = req.body
        if (!user_id || !room_id || !hotel_id || !total_price || !guests || !check_in_date || !check_out_date) return next(new errorHandling(400, "All fields are required."))
        const query = `INSERT INTO bookings (user_id,room_id,hotel_id,check_in_date,check_out_date,guest,total_price) VALUES (?,?,?,?,?,?,?)`
        const booking = await connection.promise().query(query, [user_id, room_id, hotel_id, check_in_date, check_out_date, guests, total_price])
        res.status(200).json({
            "status": true,
            "message": `Hotel  booked`
        })

    } catch (error) {
        return next(new errorHandling(500, error.message))

    }

}
