const errorHandling = require("../utils/errorHandling")
const {
    connection
} = require("../db")
const {
    validateEmail
} = require("../utils/emailValidator")
const {
    isValidNepaliPhoneNumber
} = require("../utils/phNoValidation")
const axios = require("axios");
const moment = require("moment")
const calculateNights = (checkIn, checkOut) => {
    return moment(checkOut, "YYYY-MM-DD").diff(moment(checkIn, "YYYY-MM-DD"), "days");
};
module.exports.chooseHotel = async (req, res, next) => {
    try {
        // roomNumber is the total number of room that guest has selected or enterd
        const {
            checkIn,
            checkOut,
            roomNumber,
            guestNumber,
            hotelId
        } = req.body;
        if (!checkIn || !checkOut || !roomNumber || !guestNumber || !hotelId) return next(new errorHandling(400, "All fields are required."));
        const query = `SELECT * FROM hotels WHERE id=? ` //previous name=?
        const [check] = await connection.promise().query(query, [hotelId]); //previous [hotelName]
        if (check.length === 0) {
            return next(new errorHandling(404, "Cannot find the hotel with this name."));
        }
        req.session.booking_data = {
            hotel_id: hotelId,
            check_in: checkIn,
            check_out: checkOut,
            room_number: roomNumber,
            guest_number: guestNumber,
            user_id:req.user.id,
            url: req.originalUrl
        };
        res.status(200).json({
            status: true,
            message: "Hotel choosed successfully"
        });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}
module.exports.chooseRoom = async (req, res, next) => {
    try {
        if (!req.session.booking_data) return next(new errorHandling(400, "Please fill out the previous form."));
        if (req.session.booking_data["url"] !== "/api/user/choose-hotel") return next(new errorHandling(400, "Please fil out the previous form."));
        let {
            room_id
        } = req.body;
        if (!room_id) return next(new errorHandling(400, "No room detail is given"));
        room_id = Number(room_id);
        if (isNaN(room_id)) return next(new errorHandling(400, "Invalid room details provided."));
        const query = `SELECT * FROM rooms WHERE id=?`;
        const [checkRoom] = await connection.promise().query(query, [room_id]);
        if (checkRoom.length === 0) return next(new errorHandling(404, "No room found on the database."));
        req.session.booking_data["room_id"] = room_id;
        req.session.booking_data["url"] = req.originalUrl;
        res.status(200).json({
            "status": true,
            "message": "ok"
        });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}
// module.exports.paymentDetails = (req, res, next) => {
//     try {
//         if (!req.session.booking_data) return next(new errorHandling(400, "Please fill out all the previous form."));
//         if (req.session.booking_data["url"] !== "/api/user/choose-room") return next(new errorHandling(400, "Please fil out the previous form."));
//         const missingFields = possibleFields.filter(field => !req.body[field]);
//         if (missingFields.length > 0) {
//             return next(new errorHandling(400, `Missing fields: ${missingFields.join(", ")}`));
//         }
//         for (const key in req.body) {
//             if (key === "email") {
//                 if (!validateEmail(req.body[key])) return next(new errorHandling(400, "Please enter valid email."));
//             }
//             if (key === "phone" || key == "mobile_phone") {
//                 if (!isValidNepaliPhoneNumber(req.body["phone"]) || !isValidNepaliPhoneNumber(req.body["mobile_phone"])) return next(new errorHandling(400, "Please enter valid phone number."));
//             }
//             req.session.booking_data[key] = req.body[key];
//         }
        
//         req.session.booking_data["userId"] = req.user.id;//from check jwt
//         req.session.booking_data["url"] = req.originalUrl;
//         res.status(200).json({
//             "status": true,
//             "message": "Payment details saved successfully."
//         });
//     } catch (error) {
//         return next(new errorHandling(500, error.message));
//     }
// }
module.exports.book = async (req, res, next) => {
    try {
        // Validate session data
        if (!req.session.booking_data) {
            return next(new errorHandling(400, "Please fill out all the previous forms."));
        }
        if (req.session.booking_data["url"] !== "/api/user/payment-details") {
            return next(new errorHandling(400, "Please fill out the previous form."));
        }
        // Extract booking data from session
        const {
            room_id,
            room_number,
            check_in,
            check_out
        } = req.session.booking_data;
        // Fetch room details from the database
        const roomQuery = `SELECT * FROM rooms WHERE id = ?`;
        const [searchRoom] = await connection.promise().query(roomQuery, [room_id]);
        if (searchRoom.length === 0) {
            return next(new errorHandling(404, "No room found by this ID."));
        }
        // Calculate total price
        const night = calculateNights(check_in, check_out)
        const price = (searchRoom[0].price * room_number) * Number(night);
        try {
            const response = await axios.post(process.env.PaymentUrl, {
                amount: price
            }, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            });
        } catch (error) {
            return next(new errorHandling(500, "Error while processing payment"));
        }
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
};