const {
    connection,
    connect
} = require("../db");
const {
    validateEmail
} = require("../utils/emailValidator");
const errorHandling = require("../utils/errorHandling");
const {
    isValidNepaliPhoneNumber
} = require("../utils/phNoValidation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createFullName } = require("../utils/createFullName");
const {doValidations}=require("../utils/allValidation");
const{forgetPasswordMessage}=require("../utils/forgetTemplate")
const crypto=require("crypto")
const {sendMessage}=require("../utils/nodemailer");

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
                res.clearCookie('auth_token', {
                httpOnly: true,
                sameSite: "Strict"
                 });
                return next(new errorHandling(403, "Your session has been expired.Please login again. "));
            }
            req.user = decode;
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
    
    // console.log(process.env.arole);
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(400, "You donot have permission to perform this action."))
        // query for mysql
        const query = `SELECT id, name, email, phone, phone2, dob, gender, address, country, city, zip FROM admin`
        //console.log(req.originalUrl)
        // fetching data form database
        // destructure the first index of the array
        let [data] = await connection.promise().query(query)
        if (data.length === 0) return next(new errorHandling(404, "No admin found in the database."));
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

module.exports.getOneAdmin=async(req,res,next)=>{
    try{
        const id=req.params.id;
        if(!id)return next(new errorHandling(400,"No admin id is given as parameters"));
        if(isNaN(Number(id))) return next(new errorHandling(400,"Only number are accepted."));

        const query = `SELECT id, name, email, phone, phone2, dob, gender, address, country, city, zip FROM admin WHERE id=? LIMIT 1`;

        let [data]=await connection.promise().query(query,[id]);
        if(data.length==0)return next(new errorHandling(404,"No data found by given admin id."));
        
        res.status(200).json({

            status:true,
            details:data[0]
        });    


    }catch(error){
        
        console.log(error)
        return next(new errorHandling(500,error.message));

    }
}

// @desc:Controller to create a new admin
// @method:POST
// @endPoint:localhost:4000/api/admin/create-admin
module.exports.createAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(400, "You donot have permission to perform this action."))
        if (!req.body) return next(new errorHandling(400, "Fields are empty.Please fill out the fields."));
        const possibleFields = ["firstName", "lastName", "email", "phone","phone2", "password", "confirmPassword","dob","gender","address","country","city","zip"];
        const reqBodyField = Object.keys(req.body);
        const checkFields = possibleFields.filter((field) => !reqBodyField.includes(field) || !req.body[field]);
        if (checkFields.length!==0) return next(new errorHandling(400, `${checkFields} fields are missing please fill out these fields.`));

        const validationMessage=doValidations(req.body.email, req.body.phone,req.body.phone2,req.body.password,req.body.confirmPassword);

        if(validationMessage)return next(new errorHandling(400,validationMessage));
        
        const fullName = createFullName(req.body.firstName,req.body.middleName,req.body.lastName);

        const hashedPassword = bcrypt.hashSync(req.body.password, 10);
        // const query=`INSERT INTO admin (name, email, password, phone) VALUES (${name},${email},${password},${phone})`//vulnerable to sql injection
        const query = `
            INSERT INTO admin (name, email, password, phone, phone2, dob, gender, address, country, city, zip) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values=[fullName, req.body.email, hashedPassword, req.body.phone, req.body.phone2, req.body.dob, req.body.gender, req.body.address, req.body.country, req.body.city, req.body.zip];

        await connection.promise().query(query,values); //substuting the ???? from the actual data
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

module.exports.forgetPassowrd=async (req,res,next)=>{
    try{
        const {email}=req.body
        if(!email)return next(new errorHandling(400,"Please enter email."));
        if(!validateEmail(email))return next(new errorHandling(400,"Please enter valid email address."));
        const queryForFetching=`SELECT name FROM admin WHERE email=?`
        const [data]=await connection.promise().query(queryForFetching,[email]);
        if(data.length===0)return next(new errorHandling(404,"No user found from this email address.Please reenter a email."));
        const token=crypto.randomBytes(8).toString('hex')
        const link=`${process.env.domain}api/admin/reset-password/${token}`
        const name=data[0].name;
        const message=forgetPasswordMessage(link,name);
        const subject="Reset link";

        await sendMessage(res,email,subject,message);
        const query=`UPDATE admin SET code = ? WHERE email = ?`;
        await connection.promise().query(query,[token,email]);

        res.status(200).json({
            status:true,
            message:"Reset link is sent to your email"
        })



    }catch(error){
        const quer=`UPDATE users SET code = ? WHERE email = ?`;query=`UPDATE users SET code = ? WHERE email = ?`;
        await connection.promise().query(quer,[null,email])

        return next(new errorHandling(error.statusCode ||500,error.message));
    }
}

module.exports.resetPassword=(req,res,next)=>{
    try{
        const code=req.params.code
        const {email}=req.body.email
        if(!code)return next(new errorHandling(400,"Oops something went wrong"));
        if(!email)return next(new errorHandling(400,"Please enter email address."));
        

    }catch(error){
        next(new errorHandling(error.statusCode||500,error.message));
    }
}