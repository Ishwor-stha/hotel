const errorHandling = require("../utils/errorHandling")
const {
    connection
} = require("../db")
const {
    validateEmail
} = require("../utils/emailValidator")
// const {
//     isValidNepaliPhoneNumber
// } = require("../utils/phNoValidation")
const axios = require("axios");
const moment = require("moment")
const calculateNights = (checkIn, checkOut) => {
    return moment(checkOut, "YYYY-MM-DD").diff(moment(checkIn, "YYYY-MM-DD"), "days");
};

// @desc:Controller to get the the details of hotel name check in check out no of rooms and the guest number from the user 
// @method:POST
// @endPoint:localhost:4000/api/user/booking/choose-hotel
module.exports.chooseHotel = async (req, res, next) => {
    try {
        if (req.user.role !== "user") return next(new errorHandling(401, "You are not authorized to perform this task."));
        if (!req.body || Object.keys(req.body).length === 0) return next(new errorHandling(400, "Empty request body."));
        // roomNumber is the total number of room that guest has selected or enterd
        const possibleFields = ["checkIn", "checkOut", "roomNumber", "guestNumber", "hotelId"]
        const checkFields = possibleFields.filter(field => !Object.keys(req.body).includes(field) || !req.body[field] || !String(req.body[field]).trim())
        if (checkFields.length !== 0) return next(new errorHandling(400, `${checkFields} ${checkFields.length === 1 ? "is" : "are"} missing.Please fill all the fields`));

        const query = `SELECT * FROM hotels WHERE id=? `
        const hotelId = req.body["hotelId"]
        if (isNaN(Number(hotelId))) return next(new errorHandling(400, "Invalid Hotel id."));
        const [check] = await connection.promise().query(query, [hotelId]);

        if (check.length === 0) {
            return next(new errorHandling(404, "Cannot find the hotel with this name."));
        }

        //modified verion of above code to store the data in session
        req.session.booking_data = {}
        const sessionField = ["check_in", "check_out", "room_number", "guest_number", "hotel_id"]
        for (field in sessionField) {
            // field returns the number ie(0,1,2 .....)
            const sessionFieldName = sessionField[field]
            const bodyFieldName = possibleFields[field]
            req.session.booking_data[sessionFieldName] = req.body[bodyFieldName]

        }
        req.session.booking_data["user_id"] = req.user.id
        req.session.booking_data["url1"] = req.originalUrl


        // console.log(req.session.booking_data)
        // console.log("Full session object:", req.session);
        res.status(200).json({
            status: true,
            message: "Hotel choosed successfully"
        });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}
// @desc:Controller to get the the details of room from user 
// @method:POST
// @endPoint:localhost:4000/api/user/booking/choose-room
module.exports.chooseRoom = async (req, res, next) => {
    try {
        if (req.user.role !== "user") return next(new errorHandling(401, "You are not authorized to perform this task."));
        // console.log(req.session.booking_data)

        if (!req.session.booking_data) return next(new errorHandling(400, "Please fill out the previous form."));

        if (req.session.booking_data["url1"] !== "/api/user/booking/choose-hotel") return next(new errorHandling(400, "Please fil out the previous form."));
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
        req.session.booking_data["url2"] = req.originalUrl;
        res.status(200).json({
            "status": true,
            "message": "Room selected successfully"
        });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}


// @desc:Controller to get the price and redirect to the  payment 
// @method:POST
// @endPoint:localhost:4000/api/user/booking/book
module.exports.book = async (req, res, next) => {
    try {
        if (req.user.role !== "user") return next(new errorHandling(401, "You are not authorized to perform this task."));

        // Validate session data
        if (!req.session.booking_data) {
            return next(new errorHandling(400, "Please fill out all the previous forms."));
        }
        // console.log(req.session.booking_data["url2"])
        if (req.session.booking_data["url2"] !== "/api/user/booking/choose-room") {
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
        const roomQuery = `SELECT price_per_night FROM rooms WHERE id = ?`;
        const [searchRoom] = await connection.promise().query(roomQuery, [room_id]);
        if (searchRoom.length === 0) {
            return next(new errorHandling(404, "No room found by this ID."));
        }
        // console.log(searchRoom[0])
        let roomPrice = searchRoom[0].price_per_night

        // console.log(roomPrice)

        // Calculate total price
        const night = calculateNights(check_in, check_out)
        const price = (parseFloat(roomPrice) * parseFloat(room_number)) * parseFloat(night);
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


module.exports.getBookingDataForAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You donot have enough permission to perform this task."));
        const email = req.body.email
        if (!email || Object.keys(req.body).l1ength === 0) return next(new errorHandling(400, "Please provide email to get booking data."));
        if (!validateEmail(email.trim())) return next(new errorHandling(400, "Please enter valid email address."));
        const queryForFetchingId = `SELECT id FROM users WHERE email=?`
        const [userData] = await connection.promise().query(queryForFetchingId, [email]);
        if (!userData || userData.length === 0) return next(new errorHandling(404, "No User found form this email."));

        const field = `check_in_date,check_out_date,guests,total_price,booking_date,arrival_time,number_of_room,transaction_status,transaction_uuid,transaction_code`
        const bookingDataQuery = `SELECT ${field} from bookings WHERE user_id=?`
        const id = userData[0]["id"]
        const [getBokingData] = await connection.promise().query(bookingDataQuery, [id])
        if (!getBokingData || getBokingData.length === 0) return next(new errorHandling(404, "No booking data found form this email."));
        res.status(200).json({
            status: true,
            message: getBokingData[0]
        })


    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }
}


module.exports.getBookingDataOfUser = async (req, res, next) => {
    try {
        if (req.user.role !== "user") return next(new errorHandling(401, "You donot have enough permission to perform this task."));
        const userId = req.user.id;//from checkJwt
        if (!userId) return next(new errorHandling(400, "Please login and try again."));
        if (isNaN(Number(userId))) return next(new errorHandling(404, "Invalid user id format."));

        const field = `check_in_date,check_out_date,guests,total_price,booking_date,arrival_time,number_of_room,transaction_status,transaction_uuid,transaction_code`
        const bookingDataQuery = `SELECT ${field} from bookings WHERE user_id=?`
        const [getBokingData] = await connection.promise().query(bookingDataQuery, [userId])
        if (!getBokingData || getBokingData.length === 0) return next(new errorHandling(404, "Empty booking data."));
        res.status(200).json({
            status: true,
            message: getBokingData[0]
        })


    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }
}
