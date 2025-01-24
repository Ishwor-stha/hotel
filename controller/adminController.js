const { connection, connect } = require("../db")
const { validateEmail } = require("../utils/emailValidator")
const errorHandling = require("../utils/errorHandling")
const { isValidNepaliPhoneNumber } = require("../utils/phNoValidation")


// @desc:test route
module.exports.getAll = async (req, res, next) => {
    try {
        const query = `SELECT * FROM admin`
        let [data] = await connection.promise().query(query)
        res.status(200).json({
            "status": true,
            "total": data.length,
            "admin list": data
        })

    } catch (error) {
        return res.status(500).json({
            "status": false,
            "messsage": error.message || "Something went wrong"
        })
    }

}

// @desc:controller to create an admin
//@method: POST
module.exports.createAdmin = async (req, res, next) => {
    try {

        if (!req.body) return next(new errorHandling(400, "The request body is empty."))
        const { name, email, phone, password, confirmPassword } = req.body
        if (!name || !email || !phone || !password || !confirmPassword) return next(new errorHandling(400, "All fields are required."))
        if (password !== confirmPassword) return next(new errorHandling(400, "Password doesnot match with confirm password."))
        // email validation
        if (!validateEmail(email)) return next(new errorHandling(400, "Please enter valid email address."))
        // ph no validation
        if (!isValidNepaliPhoneNumber(phone)) return next(new errorHandling(400, "Please enter valid phone number."))
        // const query=`INSERT INTO admin (name, email, password, phone) VALUES (${name},${email},${password},${phone})`//vulnerable to sql injection
        const query = `INSERT INTO admin (name, email, password, phone) VALUES (?,?,?,?)`

        const create = await connection.promise().query(query, [name, email, password, phone])//substuting the ???? from the actual data
        res.status(200).json({
            "status": true,
            "message": `${name} created sucessfully`
        })
    } catch (error) {
        return res.status(500).json({
            "status": false,
            "message": error.message || "Something went wrong on server."
        })
    }

}