const errorHandling = require("../utils/errorHandling")
const { connection } = require("../db")
const {validateEmail}=require("../utils/emailValidator")
const {isValidNepaliPhoneNumber}=require("../utils/phNoValidation")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")

module.exports.createUser = async (req, res, next) => {
    try {
        if (!req.body) return next(new errorHandling("Empty body: Ensure you're sending the correct information.", 400));
        // list all possible keys
        const {name,email,dob,gender,address,password,phone,confirmPassword}=req.body
        if (!name || !email || !dob || !gender || !address || !password || !phone || !confirmPassword )return next(new errorHandling(400,"All fields are required please fill out all the informatiion."))
        if(!validateEmail(email)) return next(new errorHandling(400,"Please enter valid email address"))
        if(!isValidNepaliPhoneNumber(phone))return next(new errorHandling(400,"Please enter valid phone number."))
        if(password !==confirmPassword) return next(new errorHandling(400,"Password and confirm password doesnot match"))
        const hashedPassword=bcrypt.hashSync(password)
        const query = `INSERT INTO users (name,email,dob,gender,address,password,phone) VALUES (?,?,?,?,?,?,?)`
        const createUser=await connection.promise().query(query,[name,email,dob,gender,address,hashedPassword,phone])
        res.status(200).json({
             "status":true,
             "messsage":name +" created sucessfully"   
        })
    } catch (error) {
        if(error.code==="ER_DUP_ENTRY") return next(new errorHandling(500,"Email address already used please try another."))
        return next(new errorHandling(500,error.message))
    }
}


module.exports.login = async (req, res, next) => {
    try {
        if(Object.keys(req.body).length>2)return next(new errorHandling(400,"Something went wrong.Please try again."))
        // Taking userName from client side
        const userEmail = req.body.email
        // taking password from client side
        const userPassword = req.body.password
        // it there is no user name or password then terminate current middleware and call errorhandling middleware with two argument ie(errormessage,statusCode)
        if (!userEmail || !userPassword) return next(new errorHandling(400, "Email or password field is empty."))
        if (!validateEmail(userEmail)) return next(new errorHandling(400, "Please enter valid email address."))

        const query = `SELECT * FROM users WHERE email = ?`;
        const [userDetail] = await connection.promise().query(query, [userEmail])
        // if there is no userDetail then terminate current middleware and call errorhandling middleware
        if (userDetail.length === 0) return next(new errorHandling(401, "Incorrect email or password.Please try again."))
        dbPassword = userDetail[0].password
        dbName = userDetail[0].name

        const validPassword = await bcrypt.compare(userPassword, dbPassword)//true/false

        // if password doesnot match then terminate this/current middleware and call error handling middleware
        if (!validPassword) return next(new errorHandling(401, "Incorrect email or password.Please try again."))
        const payload = {
            "id": userDetail[0].id,
            "email": userDetail[0].email
        }
        const token = jwt.sign(payload, process.env.jwt_secret_key, { expiresIn: process.env.jwt_expiry })
        res.cookie("auth_token", token, {
            httpOnly: true,
            sameSite: "Strict",
            maxAge: 3600 * 1000
        });

        // if password and username is valid then send the response
        res.status(200).json({
            status: true,
            message: `Hello ${dbName} welcome back.`
        })

    } catch (error) {
        return next(new errorHandling(500, error.message))
    }
}
