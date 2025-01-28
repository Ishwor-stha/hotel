const errorHandling = require("../utils/errorHandling")
const { connection } = require("../db")

// module.exports.bookTour = async (req, res, next) => {
//     try {
//         if (!req.body) return next(new errorHandling(400, "All fields are required."))
//         const { user_id, room_id, hotel_id, total_price, guests, check_out_date, check_in_date } = req.body
//         if (!user_id || !room_id || !hotel_id || !total_price || !guests || !check_in_date || !check_out_date) return next(new errorHandling(400, "All fields are required."))
//         const query = `INSERT INTO bookings (user_id,room_id,hotel_id,check_in_date,check_out_date,guest,total_price) VALUES (?,?,?,?,?,?,?)`
//         const booking = await connection.promise().query(query, [user_id, room_id, hotel_id, check_in_date, check_out_date, guests, total_price])
//         res.status(200).json({
//             "status": true,
//             "message": `Hotel  booked`
//         })

//     } catch (error) {
//         return next(new errorHandling(500, error.message))

//     }

// }

module.exports.chooseHotel = async(req, res, next) => {
    try {
        const { hotelName, checkIn, checkOut, roomNumber, guestNumber } = req.body
        if (!hotelName || !checkIn || !checkOut || !roomNumber || !guestNumber) return next(new errorHandling(400, "All fields are required."))

        const query = `SELECT * FROM hotels WHERE name=? `
        const [check] = await connection.promise().query(query, [hotelName])
        if (check.length === 0) {
            return next(new errorHandling(404, "Cannot find the hotel with this name."))

        }
        req.session.booking_data = {
            hotel_name: hotelName,
            check_in: checkIn,
            check_out: checkOut,
            room_number: roomNumber,
            guest_number: guestNumber

        }
        res.redirect("/select-room")


    } catch (error) {
        return next(new errorHandling(500, error.message))
    }
}

module.exports.chooseRoom =async (req, res, next) => {
    try {
        if (!res.session.booking_data) return next(new errorHandling(400, "Please select the hotel first."))
        const { room_id } = req.body
        if(typeof room_id !=="number") return next(new errorHandling(400,"Invalid room details is given."))
        if (!room_id) return next(new errorHandling(400, "No room detail is given"))
        const query = `SELECT * FROM rooms WHERE id=?`
        const [checkRoom]=await connection.promise().query(query,[room_id])
        if(checkRoom.length===0)return next(new errorHandling(404,"No room found on the database."))
        req.session.booking_data["room_id"] = room_id
        res.redirect("/payment")


    } catch (error) {
        return next(new errorHandling(500, error.message))

    }
}


module.exports.payment=(req,res,next)=>{
    try {
        if (!res.session.booking_data) return next(new errorHandling(400, "Please fill out all the previous form."))
           //payment form i.e from req.body 
    } catch (error) {
        return next(new errorHandling(500, error.message))
        
    }
}

// book hotel
