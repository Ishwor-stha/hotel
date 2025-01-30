const errorHandling = require("../utils/errorHandling")
const { connection } = require("../db")
const { validateEmail } = require("../utils/emailValidator")
const { isValidNepaliPhoneNumber } = require("../utils/phNoValidation")

module.exports.chooseHotel = async (req, res, next) => {
    try {
        const { hotelName, checkIn, checkOut, roomNumber, guestNumber, hotelId } = req.body
        if (!hotelName || !checkIn || !checkOut || !roomNumber || !guestNumber || !hotelId) return next(new errorHandling(400, "All fields are required."))

        const query = `SELECT * FROM hotels WHERE name=? `
        const [check] = await connection.promise().query(query, [hotelName])
        if (check.length === 0) {
            return next(new errorHandling(404, "Cannot find the hotel with this name."))

        }
        req.session.booking_data = {
            hotel_id: hotelId,
            hotel_name: hotelName,
            check_in: checkIn,
            check_out: checkOut,
            room_number: roomNumber,
            guest_number: guestNumber,
            url: req.originalUrl

        }



    } catch (error) {
        return next(new errorHandling(500, error.message))
    }
}

module.exports.chooseRoom = async (req, res, next) => {
    try {
        if (!req.session.booking_data) return next(new errorHandling(400, "Please fil out the previous form."))
        if (req.session.booking_data["url"] !== "/api/user/hotel") return next(new errorHandling(400, "Please fil out the previous form."))
        const { room_id } = req.body
        if (!room_id) return next(new errorHandling(400, "No room detail is given"))
        room_id = Number(room_id)
        if (isNaN(room_id)) return next(new errorHandling(400, "Invalid room details provided."));
        const query = `SELECT * FROM rooms WHERE id=?`
        const [checkRoom] = await connection.promise().query(query, [room_id])
        if (checkRoom.length === 0) return next(new errorHandling(404, "No room found on the database."))
        req.session.booking_data["room_id"] = room_id
        req.session.booking_data["url"] = req.originalUrl

        res.status(200).json({
            "status": true,
            "message": "ok"
        })

    } catch (error) {
        return next(new errorHandling(500, error.message))

    }
}


module.exports.paymentDetails = (req, res, next) => {
    try {
        if (!req.session.booking_data) return next(new errorHandling(400, "Please fill out all the previous form."))
        if (req.session.booking_data["url"] !== "/api/user/room") return next(new errorHandling(400, "Please fil out the previous form."))
        const possibleFields = ["firstName", "lastName", "email", "mobile_phone", "remarks", "title", "country", "address", "city", "zip", "phone", "dob", "arrivalTime"]
        if (!req.body.remarks) req.body["remarks"] = "."
        const bodyLength = Object.keys(req.body).length
        if (bodyLength !== 13) return next(new errorHandling(400, "All fields are required please fill out the form."))

        for (const key in req.body) {
            if (!possibleFields.includes(key)) return next(new errorHandling(400, "All fields are required please fill out the form."))
            if (key === "email") {
                if (!validateEmail(req.body[key])) return next(new errorHandling(400, "Please enter valid email."))
            }
            if (key === "mobile_phone" || key === "phone") {
                if (!isValidNepaliPhoneNumber(req.body[key])) return next(new errorHandling(400, "Please enter valid phone number."))
            }

            req.session.booking_data[key] = req.body[key]
        }


        req.session.booking_data["userId"] = req.user.id
        req.session.booking_data["url"] = req.originalUrl

        res.status(200).json({
            "status": true,
            "message": "Payment details saved successfully."
        });
    } catch (error) {
        return next(new errorHandling(500, error.message))

    }
}

module.exports.book = async (req, res, next) => {
    try {
        if (!req.session.booking_data) return next(new errorHandling(400, "Please fill out all the previous form."))
        if (req.session.booking_data["url"] !== "/api/user/details") return next(new errorHandling(400, "Please fill out the previous form."))
        const firstName = req.session.booking_data["firstName"]
        const lastName = req.session.booking_data["lastName"]
        const email = req.session.booking_data["email"]
        const mobile_phone = req.session.booking_data["mobile_phone"]
        const remarks = req.session.booking_data["remarks"]
        const title = req.session.booking_data["title"]
        const country = req.session.booking_data["country"]
        const address = req.session.booking_data["firstName"]
        const city = req.session.booking_data["city"]
        const zip = req.session.booking_data["zip"]
        const phone = req.session.booking_data["phone"]
        const dob = req.session.booking_data["dob"]
        const arrival_time = req.session.booking_data["arrival_time"]
        const query = `INSERT INTO bookings (firstName,lastName,email,mobile_phone,remarks,title,country,address,city,zip,phone,dob,arrival_time) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
        const insertDetail = await connection.promise().query(query, [firstName, lastName, email, mobile_phone, remarks, title, country, address, city, zip, phone, dob, arrival_time])


    } catch (error) {
        return next(new errorHandling(500, error.message))
    }

}