const crypto = require('crypto');
const axios = require('axios');
const path = require('path');
const {
    connection
} = require("../db")
const errorHandling = require("../utils/errorHandling");



module.exports.payWithEsewa = async (req, res, next) => {
    if (!req.body) return errorHandling(400, "All data field is required");
    if (!req.body.amount) return next(new errorHandling(400, "No amount is given.Please try again later."));
    try {
        const {
            amount,
            tax_amount = 0,
            product_service_charge = 0,
            product_delivery_charge = 0
        } = req.body;
        if (!amount) return next(new errorHandling(400, "No amount is given.Please enter a amount"));
        if (amount <= 0) return next(new errorHandling(400, "Amount must be above 0."))
        const total_amount = parseFloat(amount) + parseFloat(tax_amount) + parseFloat(product_service_charge) + parseFloat(product_delivery_charge);
        const transaction_uuid = Date.now();
        const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${PRODUCT_CODE}`;
        const signature = crypto.createHmac('sha256', SECRET_KEY).update(message).digest('base64');
        const paymentData = {
            amount: parseFloat(amount),
            tax_amount: parseFloat(tax_amount),
            total_amount: parseFloat(total_amount),
            product_service_charge: parseFloat(product_service_charge),
            product_delivery_charge: parseFloat(product_delivery_charge),
            transaction_uuid: transaction_uuid,
            product_code: process.env.PRODUCT_CODE,
            success_url: process.env.SUCCESS_URL,
            failure_url: process.env.FAILURE_URL,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: signature,
        };
        // console.log( paymentData);  
        // Send request to eSewa API
        const pay = await axios.post(process.env.BASE_URL, new URLSearchParams(paymentData).toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        // console.log(pay.request.res.responseUrl)
        res.redirect(pay.request.res.responseUrl);
    } catch (error) {
        console.log(error);
        return next(new errorHandling(500, "server error"));
    }
}


module.exports.success = async (req, res, next) => {
    try {
        if (!req.query.data) return next(new errorHandling(500, "Server error"));
        const encodedData = req.query.data;
        const decodedData = JSON.parse(Buffer.from(encodedData, "base64").toString("utf-8"));
        const keys = ["total_amount", "transaction_uuid", "transaction_code", "signed_field_names", "status"];
        for (key in decodedData) {
            if (!keys.includes(key)) {
                return next(new errorHandling(500, "Server error"));
            }
        }
        const TotalAmt = decodedData.total_amount.replace(/,/g, ''); //removing the comma from the amount for hashing the message ie (5,000)=>(5000)
        const message = `transaction_code=${decodedData.transaction_code},status=${decodedData.status},total_amount=${TotalAmt},
        transaction_uuid=${decodedData.transaction_uuid},product_code=${process.env.PRODUCT_CODE},signed_field_names=${decodedData.signed_field_names}`;
        const hash = crypto.createHmac("sha256", SECRET_KEY).update(message).digest("base64");
        if (hash !== decodedData.signature) {
            return next(new errorHandling(400, "Invalid signature"));
        }
        const response = await axios.get(process.env.STATUS_CHECK, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            params: {
                product_code: PRODUCT_CODE,
                total_amount: TotalAmt,
                transaction_uuid: decodedData.transaction_uuid
            }
        });
        const {
            status,
            transaction_uuid,
            total_amount,
            transaction_code
        } = response.data;
        if (status !== "COMPLETE" || transaction_uuid !== decodedData.transaction_uuid || Number(total_amount) !== Number(TotalAmt)) {
            return next(new errorHandling(400, "Invalid transaction details"))
        }
        const data = {
            status: status,
            transaction_uuid: transaction_uuid,
            total_amount: total_amount,
            transactionCode: transaction_code
        }
        await insertDetaisToDatabase(req.session, data);
        return res.sendFile(path.join(__dirname, '..', 'public', 'sucess.html'));
    } catch (error) {
        return next(new errorHandling(500, "Server error"));
    }
}


module.exports.failure = (req, res, next) => {
    try {
        return res.sendFile(path.join(__dirname, '..', 'public', 'failed.html'));
        // res.status(500).json({
        //     status: false,
        //     message: 'Transaction failed.Please try again later.',
        // });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}
const insertDetaisToDatabase = async (session, data) => {
    const {
        room_id,
        hotel_id,
        user_id,
        arrival_time,
        room_number,
        guest_number,
        check_in,
        check_out
    } = session.booking_data;

    const {
        status,
        transaction_uuid,
        total_price,
        transactionCode
    } = data;

    const bookingQuery = `
        INSERT INTO bookings 
        (user_id, hotel_id, room_id, arrival_time, number_of_room, guests, check_in_date, check_out_date, transaction_status, transaction_uuid, transaction_code, total_price) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const [insertDetail] = await connection.promise().query(bookingQuery, [
        user_id,
        hotel_id,
        room_id,
        arrival_time,
        room_number,
        guest_number,
        check_in,
        check_out,
        status,
        transaction_uuid,
        transactionCode,
        total_price
    ]);

    
};
