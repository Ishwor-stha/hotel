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
            url1: req.originalUrl
        };
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
        if (!req.session.booking_data) return next(new errorHandling(400, "Please fill out the previous form."));
        if (req.session.booking_data["url1"] !== "/api/user/choose-hotel") return next(new errorHandling(400, "Please fil out the previous form."));
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
            "message": "ok"
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
        // Validate session data
        if (!req.session.booking_data) {
            return next(new errorHandling(400, "Please fill out all the previous forms."));
        }
        if (req.session.booking_data["url2"] !== "/api/user/payment-details") {
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
        const roomQuery = `SELECT price FROM rooms WHERE id = ?`;
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


module.exports.getBookingDataForAdmin=async(req,res,next)=>{
    try{
        if(req.user.role!=="admin")return next (new errorHandling(401,"You donot have enough permission to perform this task."));
        const {email}=req.body.email 
        if(!email || Object.keys(req.body.email).length===0)return next (new errorHandling(400,"Please provide email to get booking data."));
        if(!validateEmail(email.trim()))return next (new errorHandling(400,"Please enter valid email address."));
        const query= `SELECT id FROM users WHERE email=?`
        const [userData]=await connection.promise().query(query,[email]);
        res.status(200).json({
            status:true,
            message:" this is the booking data for admin "
        })





    }catch(error){
        return next(new errorHandling(errro.statusCode ||500,error.message))
    }
}



// module.exports.getBookingDataForUser=async(req,res,next)=>{
//     try{
       

//     }catch(error){
//         return next(new errorHandling(errro.statusCode ||500,error.message))
//     }
// }