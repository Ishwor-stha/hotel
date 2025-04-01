const errorHandling = require("../utils/errorHandling");
const mysql = require("mysql2")
const {
    connection
} = require("../db");
const {
    validateEmail
} = require("../utils/emailValidator");
// const {
//     isValidNepaliPhoneNumber
// } = require("../utils/phNoValidation")
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const jwt = require("jsonwebtoken");
const {
    doValidations
} = require("../utils/allValidation");
const {
    createFullName
} = require("../utils/createFullName")
// const sendMail=require("../utils/sendMail")
const {
    messageTemplate
} = require("../utils/verificationMessage")
const {
    sendMessage
} = require("../utils/nodemailer")
const {
    forgetPasswordMessage
} = require("../utils/forgetTemplate")
const {
    updateValidation
} = require("../utils/updateValidation")
// @desc:Controller to create a new user
// @method:POST
// @endPoint:localhost:4000/api/user/create-user
module.exports.createUser = async (req, res, next) => {
    try {
        if (!req.body) return next(new errorHandling("Empty body: Ensure you're sending the correct information.", 400));
        // list all possible keys
        const possibleFields = ["firstName", "lastName", "email", "dob", "country", "gender", "city", "zip", "address", "password", "phone2", "phone", "confirmPassword"];
        const bodyField = Object.keys(req.body);
        // stores the key name  if the key is missing or the field is empty
        const missing = possibleFields.filter((field) => !bodyField.includes(field) || !req.body[field])
        if (missing.length !== 0) return next(new errorHandling(400, `Please fill these fields ${missing}`))
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
        const validationMessage = await doValidations(email, phone, phone2, password, confirmPassword);
        if (validationMessage) return next(new errorHandling(400, validationMessage));
        const [checkUser] = await connection.promise().query("SELECT name FROM users WHERE email= ?", [email])
        if (checkUser.length !== 0) return next(new errorHandling(500, "Email address is already used.Please try another email."));
        const fullName = createFullName(firstName, middleName, lastName);
        // email duplication error
        // hash password
        const hashedPassword = bcrypt.hashSync(password, 10);
        const code = crypto.randomInt(100000, 1000000); // Generates number from 100000 to 999999
        const sessionID = crypto.randomInt(100000, 1000000);
        req.session.userData = {
            fullName: fullName,
            email: email,
            dob: dob,
            country: country,
            gender: gender,
            city: city,
            zip: zip,
            address: address,
            password: hashedPassword,
            phone2: phone2,
            phone: phone,
            code: code,
            sessionID: sessionID
        }
        const payload = {
            email: email,
            sessionID: sessionID
        }
        const message = messageTemplate(code, fullName,);
        const subject = "Verification code";
        // await sendMail(next,message,email,fullName);
        await sendMessage(res, email, subject, message)
        const verificationToken = jwt.sign(payload, process.env.jwt_secret_key, {
            expiresIn: process.env.jwt_expiry
        });
        res.cookie("verificationToken", verificationToken, {
            httpOnly: true,
            sameSite: "Strict"
        })
        // // mysql query
        // const query = `INSERT INTO users (name, email, dob, gender, address, password, phone, phone2, country, city, zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        // //inserting the user details in database
        // const createUser = await connection.promise().query(query, [fullName, email, dob, gender, address, hashedPassword, phone, phone2, country, city, zip]);
        //function to send mail
        res.status(200).json({
            "status": true,
            "message": "Code sent to your email"
        });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}

// @desc:Controller to verify user 
// @method:POST
// @endPoint:localhost:4000/api/user/verify-user
module.exports.veriyfyUser = async (req, res, next) => {
    try {
        const code = req.body.code
        const token = req.cookies.verificationToken;
        if (!token) return next(new errorHandling(500, "Please fill up the form again."));
        if (!code) return next(new errorHandling(500, "Invalid code given.Please try again with valid code."));
        if (String(code).length != 6) return next(new errorHandling(500, "The code length must be 6.Please enter valid code"));
        if (isNaN(Number(code))) return next(new errorHandling(500, "Invalid code.A code must be a number."));
        let userDetails;
        try {
            userDetails = jwt.verify(token, process.env.jwt_secret_key);
        } catch (err) {
            res.clearCookie('verificationToken');
            return next(new errorHandling(403, "Please fill out the form again. The verification time is over."));
        }
        // console.log(userDetails)
        // console.log(req.session.userData)
        if (userDetails.email !== req.session.userData.email || userDetails.sessionID !== req.session.userData.sessionID) {
            req.session.destroy((err) => {
                if (err) return next(new errorHandling(500, "Something went wrong."));
            })
            return next(new errorHandling(500, "Oops something went wrong"));
        }
        if (code !== req.session.userData.code) return next(new errorHandling(404, "The code doesnot match.Please enter correct code."));
        const values = [req.session.userData.fullName, req.session.userData.email, req.session.userData.dob, req.session.userData.gender, req.session.userData.address, req.session.userData.password, req.session.userData.phone, req.session.userData.phone2, req.session.userData.country, req.session.userData.city, req.session.userData.zip]
        // destroy the session
        await req.session.destroy((err) => {
            if (err) return next(new errorHandling(500, "Something went wrong."));
        })
        // clear the verificationToken from the client
        res.clearCookie('verificationToken');
        // // mysql query
        const query = `INSERT INTO users (name, email, dob, gender, address, password, phone, phone2, country, city, zip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        // //inserting the user details in database
        const createUser = await connection.promise().query(query, values);
        res.status(200).json({
            status: true,
            message: "Account verified sucessfully.Please login again."
        })
    } catch (error) {
        // console.log("hello")
        await res.clearCookie('verificationToken');
        await req.session.destroy((err) => {
            if (err) return next(new errorHandling(500, "Something went wrong.Please fill up the form again"));
        })

        return next(new errorHandling(500, error.message));
    }
}
// @desc:Controller to login by user
// @method:POST
// @endPoint:localhost:4000/api/user/login
module.exports.login = async (req, res, next) => {
    try {
        //length of  keys in req.body must be 2 
        if (Object.keys(req.body).length !== 2) return next(new errorHandling(400, "Some field are missing please fill out all the form."));
        // Taking userName from client side
        const userEmail = req.body.email;
        // taking password from client side
        const userPassword = req.body.password;
        // it there is no user name or password then terminate current middleware and call errorhandling middleware with two argument ie(errormessage,statusCode)
        if (!userEmail || !userPassword) return next(new errorHandling(400, "Email or password field is empty."));
        if (!validateEmail(userEmail)) return next(new errorHandling(400, "Please enter valid email address."));
        // query for sql 
        const query = `SELECT * FROM users WHERE email = ?`;
        // fetching data form database
        const [userDetail] = await connection.promise().query(query, [userEmail]);
        // if there is no userDetail then terminate current middleware and call errorhandling middleware
        if (userDetail.length === 0) return next(new errorHandling(401, "Incorrect email or password.Please try again."));
        // password form database
        dbPassword = userDetail[0].password;
        // name from database
        dbName = userDetail[0].name;
        // comparing password
        const validPassword = await bcrypt.compare(userPassword, dbPassword); //true/false
        // if password doesnot match then terminate this/current middleware and call error handling middleware
        if (!validPassword) return next(new errorHandling(401, "Incorrect email or password.Please try again."));
        // creating payload for jwt token
        const payload = {
            "id": userDetail[0].id,
            "email": userDetail[0].email,
            "role": userDetail[0].role
        }
        // generating jwt token
        const token = await jwt.sign(payload, process.env.jwt_secret_key, {
            expiresIn: process.env.jwt_expiry
        });
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
        });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}

// @desc:Controller to find the user by id
// @method:GET
// @endPoint:localhost:4000/api/user/get-user/14
module.exports.findUserById = async (req, res, next) => {
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You do not have enough permission to take this action."));
        let userId = req.params.userId;
        // if the user gives only space in the params then throw error
        if (userId.split(" ")[0] === "") return next(new errorHandling(400, "Invalid user id.Please enter valid user id."));
        if (isNaN(Number(userId))) return next(new errorHandling(400, "Invalid user id.Please enter valid user id."));
        const fieldName = `name,email,dob,gender,address,country,zip,phone,phone2`
        const query = `SELECT ${fieldName} FROM users WHERE id=?`
        const [getUser] = await connection.promise().query(query, [userId])
        if (getUser.length === 0) return next(new errorHandling(404, "Cannot get user from this id please try valid id"))
        res.status(200).json({
            status: true,
            message: "User details fetched sucessfully.",
            userData: getUser[0]
        })

    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }

}

// @desc:Controller to find the user BY EMAIL
// @method:GET
// @endPoint:localhost:4000/api/user/get-user/
module.exports.findUserByEmail = async (req, res, next) => {
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You do not have enough permission to take this action."));
        let userEmail = req.body.email
        if (!userEmail) return next(new errorHandling(400, "No email is given please provide email address."));
        if (!validateEmail(userEmail)) return next(new errorHandling(400, "Email is not valid please enter valid email address"));
        const fieldName = `name,email,dob,gender,address,country,zip,phone,phone2`
        const query = `SELECT ${fieldName} FROM users WHERE email=?`
        const [getUser] = await connection.promise().query(query, [userEmail])
        if (getUser.length === 0) return next(new errorHandling(404, "No user found from this email."))
        res.status(200).json({
            status: true,
            message: "User details fetched sucessfully.",
            userData: getUser[0]
        })

    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }

}

// @desc:Controller to find update user 
// @method:PATCH
// @endPoint:http://localhost:4000/api/user/update-user
module.exports.updateUser = async (req, res, next) => {
    try {
        if (req.user.role !== "user") return next(new errorHandling(401, "You do not have enough permission to take this action."));
        const userId = req.user.id;
        if (!userId || isNaN(Number(userId))) return next(new errorHandling(400, "Invalid user ID. Please log in again."));
        if (Object.keys(req.body).length === 0) return next(new errorHandling(400, "Empty body field. Please fill up the form."));
        const possibleFields = ["firstName", "middleName", "lastName", "email", "dob", "country", "gender", "city", "zip", "address", "password", "phone2", "phone", "confirmPassword"];
        const bodyField = Object.keys(req.body).filter(field => possibleFields.includes(field) && req.body[field]);
        if (bodyField.length === 0) return next(new errorHandling(400, "Empty body field. Please fill up the form."));
        // Name update logic
        let name = "";
        if (req.body["firstName"] || req.body["middleName"] || req.body["lastName"]) {
            const [dbName] = await connection.promise().query(`SELECT name FROM users WHERE id = ?`, [userId]);
            if (dbName.length > 0) {
                let nameArray = dbName[0].name.split(" ");
                // Ensure nameArray has at least 3 elements (First, Middle, Last)
                while (nameArray.length < 3) {
                    nameArray.push("");
                }
                // Extract user input
                const fName = req.body["firstName"];
                const mName = req.body["middleName"];
                const lName = req.body["lastName"];
                // Construct the new name
                name = `${fName ? fName : nameArray[0]} ${mName ? mName : nameArray[1]} ${lName ? lName : nameArray[2]}`.trim();
            }
        }
        const validationMessage = updateValidation(req.body["email"], req.body["phone"], req.body["phone2"], req.body["password"], req.body["confirmPassword"]);
        if (validationMessage) return next(new errorHandling(400, validationMessage));
        // Hash password if it exists
        if (req.body["password"]) {
            req.body["password"] = bcrypt.hashSync(req.body["password"], 10);
        }
        let fieldWithQuestionMark = [];
        let values = [];
        bodyField.forEach(field => {
            if (field === "confirmPassword") return; // Skip 'confirmPassword'
            if (["firstName", "middleName", "lastName"].includes(field)) {
                if (!fieldWithQuestionMark.includes("name=?")) {
                    fieldWithQuestionMark.push("name=?");
                    values.push(name);
                }
            } else {
                fieldWithQuestionMark.push(`${field}=?`);
                values.push(req.body[field]);
            }
        });
        // Secure parameterized query
        fieldWithQuestionMark.push("updated_at=?")
        values.push(mysql.raw("CURRENT_TIMESTAMP"))
        const query = `UPDATE users SET ${fieldWithQuestionMark.join(", ")} WHERE id = ?`;
        values.push(userId); // Ensure userId is added safely
        // console.log(query)
        // console.log(values)
        const [updateUser] = await connection.promise().query(query, values);
        if (updateUser.affectedRows === 0) return next(new errorHandling(500, "Cannot update the details. Please try again later."));
        res.status(200).json({
            status: true,
            message: "Details updated successfully."
        });
    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message));
    }
};

// @desc:Controller to send the reset link to the user email
// @method:POST
// @endPoint:http://localhost:4000/api/user/forget-password
module.exports.forgetPassword = async (req, res, next) => {
    try {
        const {
            email
        } = req.body
        if (!email) return next(new errorHandling(400, "Please enter email."));
        if (!validateEmail(email)) return next(new errorHandling(400, "Please enter valid email address."));
        const queryForFetching = `SELECT name FROM users WHERE email=?`
        const [data] = await connection.promise().query(queryForFetching, [email]);
        if (data[0].length === 0) return next(new errorHandling(404, "No user found from this email address.Please reenter a email."));
        const token = crypto.randomBytes(8).toString('hex')
        const link = `${process.env.domain}api/user/reset-password/${token}`
        const name = data[0].name;
        const message = forgetPasswordMessage(link, name);
        const subject = "Reset link";
        await sendMessage(res, email, subject, message);
        const query = `UPDATE users SET code = ? WHERE email = ?`;
        await connection.promise().query(query, [token, email]);
        res.status(200).json({
            status: true,
            message: "Reset link is sent to your email"
        })
    } catch (error) {
        const quer = `UPDATE users SET code = ? WHERE email = ?`;
        await connection.promise().query(quer, [null, email])
        return next(new errorHandling(error.statusCode || 500, error.message));
    }
}

// @desc:Controller to update the password
// @method:PATCH
// @endPoint:http://localhost:4000/api/user/reset-password/:code
module.exports.resetPassword = async (req, res, next) => {
    try {
        const userCode = req.params.code
        const {
            email,
            password,
            confirmPassword
        } = req.body
        if (!userCode) return next(new errorHandling(400, "Oops something went wrong"));
        if (!email || !password || !confirmPassword) return next(new errorHandling(400, "Email,password or confirmPassword is missng please fill out the form again."));
        if (!validateEmail(email)) return next(new errorHandling(400, "Please enter valid email address"));
        if (password !== confirmPassword) return next(new errorHandling(400, "Confirm password and password must be same."));
        const [query] = await connection.promise().query(`SELECT email,code FROM users WHERE email=?`, [email]);
        if (!query || query[0].length === 0) return next(new errorHandling(400, "The code or email is not found.Please try again."));
        if (!query[0].code) return next(new errorHandling(400, "Something went wrong.Please try to resend code again"));
        if (query[0].code !== userCode) return next(new errorHandling(400, "Please enter correct code."));
        const hashedPassword = bcrypt.hashSync(password, 10);
        await connection.promise().query(`UPDATE admin SET password = ?,code=?,updated_at=? WHERE email = ?`, [hashedPassword, null, mysql.raw("CURRENT_TIMESTAMP"), email])
        res.status(200).json({
            status: true,
            message: "Password updated sucessfully"
        })
    } catch (error) {
        next(new errorHandling(error.statusCode || 500, error.message));
    }
}