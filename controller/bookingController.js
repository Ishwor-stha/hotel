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
        // Validate session data
        if (!req.session.booking_data) {
            return next(new errorHandling(400, "Please fill out all the previous forms."));
        }
        if (req.session.booking_data["url"] !== "/api/user/details") {
            return next(new errorHandling(400, "Please fill out the previous form."));
        }

        // Extract booking data from session
        const {
            room_id,
            firstName,
            lastName,
            email,
            mobile_phone,
            remarks,
            title,
            country,
            address,
            city,
            zip,
            phone,
            dob,
            arrival_time,
            room_number,
        } = req.session.booking_data;

        // Fetch room details from the database
        const roomQuery = `SELECT * FROM rooms WHERE id = ?`;
        const [searchRoom] = await connection.promise().query(roomQuery, [room_id]);

        if (searchRoom.length === 0) {
            return next(new errorHandling(404, "No room found by this ID."));
        }

        // Calculate total price
        const price = searchRoom[0].price * room_number;

        // Insert booking details into the database
        const bookingQuery = `
            INSERT INTO bookings 
            (firstName, lastName, email, mobile_phone, remarks, title, country, address, city, zip, phone, dob, arrival_time, room_id, price) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [insertDetail] = await connection.promise().query(bookingQuery, [
            firstName,
            lastName,
            email,
            mobile_phone,
            remarks,
            title,
            country,
            address,
            city,
            zip,
            phone,
            dob,
            arrival_time,
            room_id,
            price,
        ]);

        // Generate a unique order ID for payment
        const orderId = `ORDER_${insertDetail.insertId}`;

        // Redirect to eSewa payment page
        const paymentData = {
            amt: price, // Amount to be paid
            psc: 0, // Service charge
            pdc: 0, // Delivery charge
            txAmt: 0, // Tax amount
            tAmt: price, // Total amount
            pid: orderId, // Unique order ID
            scd: 'EPAYTEST', // Merchant code (use your Merchant ID in production)
            su: 'http://localhost:4000/payment-success', // Success URL
            fu: 'http://localhost:4000/payment-failure', // Failure URL
        };

        // Redirect to eSewa payment page
        res.send(`
            <form action="https://uat.esewa.com.np/epay/main" method="POST">
                ${Object.entries(paymentData)
                .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
                .join('')}
                <input type="submit" value="Pay with eSewa">
            </form>
            <script>document.forms[0].submit();</script>
        `);

    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
};