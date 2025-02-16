const errorHandling = require("../utils/errorHandling");
const {
    connection
} = require("../db");
const {
    validateEmail
} = require("../utils/emailValidator");
const {
    isValidNepaliPhoneNumber
} = require("../utils/phNoValidation")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {doValidations}=require("../utils/allValidation");

// @desc:Controller to create a new user
// @method:POST
// @endPoint:localhost:4000/api/user/create-user
module.exports.createUser = async (req, res, next) => {
    try {
        if (!req.body) return next(new errorHandling("Empty body: Ensure you're sending the correct information.", 400));
        // list all possible keys
        const possibleFields = ["firstName", "lastName", "email", "dob", "country", "gender", "city", "zip", "address", "password", "phone2", "phone", "confirmPassword"];
        const bodyField=Object.keys(req.body);
        // stores the key name  if the key is missing or the field is empty
        const missing=possibleFields.filter((field)=> !bodyField.includes(field) || !req.body[field])
        if(missing.length!==0)return next(new errorHandling(400,`Please fill these fields ${missing}`))
            console.log("hello");
        // destructing the req.body object
        const {
            firstName,
            middleName,
            lastName,
            email,
            dob,
            country,
            gender,
            city,
            zip,
            address,
            password,
            phone2,
            phone,
            confirmPassword
        } = req.body;
        
        
        let fullName;
        // no middle name is given
        if (!middleName) {
            fullName = `${firstName} ${lastName}`;
        } else {
            fullName = `${firstName} ${middleName} ${lastName}`;
        }

        const validationMessage=await doValidations(email,phone,phone2,password,confirmPassword);
        if(validationMessage)return next(new errorHandling(400,validationMessage) )
        // hash password
        const hashedPassword = bcrypt.hashSync(password);
        // mysql query
        const query = `INSERT INTO users (name, email, dob, gender, address, password, phone, phone2, country, city, zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        //inserting the user details in database
        const createUser = await connection.promise().query(query, [fullName, email, dob, gender, address, hashedPassword, phone, phone2, country, city, zip]);
        
        res.status(200).json({
            "status": true,
            "message": fullName + " created successfully"
        });
    } catch (error) {
        // email duplication error
        if (error.code === "ER_DUP_ENTRY") return next(new errorHandling(500,"Email address already used, please try another."));
        console.log(error);
        return next(new errorHandling(500,error.message));
    }
}

// @desc:Controller to login by user
// @method:POST
// @endPoint:localhost:4000/api/user/login
module.exports.login = async (req, res, next) => {
    try {
        //length of  keys in req.body must be 2 
        if (Object.keys(req.body).length > 2) return next(new errorHandling(400, "Something went wrong.Please try again."))
        // Taking userName from client side
        const userEmail = req.body.email
        // taking password from client side
        const userPassword = req.body.password
        // it there is no user name or password then terminate current middleware and call errorhandling middleware with two argument ie(errormessage,statusCode)
        if (!userEmail || !userPassword) return next(new errorHandling(400, "Email or password field is empty."))
        if (!validateEmail(userEmail)) return next(new errorHandling(400, "Please enter valid email address."))
        
        // query for sql 
        const query = `SELECT * FROM users WHERE email = ?`;
        // fetching data form database
        const [userDetail] = await connection.promise().query(query, [userEmail])
        // if there is no userDetail then terminate current middleware and call errorhandling middleware
        if (userDetail.length === 0) return next(new errorHandling(401, "Incorrect email or password.Please try again."))
        // password form database
        dbPassword = userDetail[0].password
        // name from database
        dbName = userDetail[0].name
        // comparing password
        const validPassword = await bcrypt.compare(userPassword, dbPassword) //true/false
        // if password doesnot match then terminate this/current middleware and call error handling middleware
        if (!validPassword) return next(new errorHandling(401, "Incorrect email or password.Please try again."))
        // creating payload for jwt token
        const payload = {
            "id": userDetail[0].id,
            "email": userDetail[0].email
        }
        // generating jwt token
        const token = await jwt.sign(payload, process.env.jwt_secret_key, {
            expiresIn: process.env.jwt_expiry
        })
        // sending the token to user
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