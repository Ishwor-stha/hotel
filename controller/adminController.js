const {
    connection,
    connect
} = require("../db")
const {
    validateEmail
} = require("../utils/emailValidator")
const errorHandling = require("../utils/errorHandling")
const {
    isValidNepaliPhoneNumber
} = require("../utils/phNoValidation")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")



// @desc:Controller to check the the token is valid or not
 
module.exports.checkJwt = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        // no token
        if (!token) {
            return next(new errorHandling(403, "Please login and try again."));
        }
        // check token
        jwt.verify(token, process.env.jwt_secret_key, (err, decode) => {
            if (err) {
                console.log(err)
                return next(new errorHandling(403, "Your session has been expired.Please login again. "));
            }
            req.user = decode;
            console.log(req.user);
            next();
        })
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}
// @desc:Controller to fetch all the admin form database
// @method:GET
// @endPoint:localhost:4000/api/admin/get
module.exports.getAll = async (req, res, next) => {
    try {
        // query for mysql
        const query = `SELECT * FROM admin`
        //console.log(req.originalUrl)
        // fetching data form database
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
// @desc:Controller to create a new admin
// @method:POST
// @endPoint:localhost:4000/api/admin/create-admin
module.exports.createAdmin = async (req, res, next) => {
    try {
        if (!req.body) return next(new errorHandling(400, "Fields are empty.Please fill out the fields."));
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            confirmPassword
        } = req.body;
        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) return next(new errorHandling(400, "Fields are empty.Please fill out the fields."));
        if (password !== confirmPassword) return next(new errorHandling(400, "Password does not match with confirm password."));
        // email validation
        if (!validateEmail(email)) return next(new errorHandling(400, "Please enter valid email address."));
        // ph no validation
        if (!isValidNepaliPhoneNumber(phone)) return next(new errorHandling(400, "Please enter valid phone number."));
        // const query=`INSERT INTO admin (name, email, password, phone) VALUES (${name},${email},${password},${phone})`//vulnerable to sql injection
        const query = `INSERT INTO admin (name, email, password, phone) VALUES (?,?,?,?)`;
        const hashedPassword = bcrypt.hashSync(password, 10);
        fullName = `${firstName.toLowerCase()} ${lastName.toLowerCase()}`;
        const create = await connection.promise().query(query, [fullName, email, hashedPassword, phone]) //substuting the ???? from the actual data
        res.status(200).json({
            "status": true,
            "message": `${fullName} created sucessfully.`
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return next(new errorHandling(500, `An account with this email address is already exists.Please try another email address.`));
        return next(new errorHandling(500, error.message));
    }
}

// @desc:Controller to login for admin
// @method:POST
// @endPoint:localhost:4000/api/admin/login
module.exports.login = async (req, res, next) => {
    try {
        // Taking userName from client side
        const userEmail = req.body.email;
        // taking password from client side
        const userPassword = req.body.password;
        // it there is no user name or password then terminate current middleware and call errorhandling middleware with two argument ie(errormessage,statusCode)
        if (!userEmail || !userPassword) return next(new errorHandling(400, "Email or password field is empty."));
        if (!validateEmail(userEmail)) return next(new errorHandling(400, "Please enter valid email address."));
        const query = `SELECT * FROM admin WHERE email = ?`;
        const [userDetail] = await connection.promise().query(query, [userEmail]);
        // if there is no userDetail then terminate current middleware and call errorhandling middleware
        if (userDetail.length === 0) return next(new errorHandling(401, "Incorrect email or password.Please try again."));
        dbPassword = userDetail[0].password;
        dbName = userDetail[0].name;
        const validPassword = await bcrypt.compare(userPassword, dbPassword); //true/false
        // if password doesnot match then terminate this/current middleware and call error handling middleware
        if (!validPassword) return next(new errorHandling(401, "Incorrect email or password.Please try again."));
        const payload = {
            "id": userDetail[0].id,
            "email": userDetail[0].email,
            "role": userDetail[0].role

        };
        const token = jwt.sign(payload, process.env.jwt_secret_key, {
            expiresIn: process.env.jwt_expiry
        });
        res.cookie("auth_token", token, {
            httpOnly: true,
            sameSite: "Strict",
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