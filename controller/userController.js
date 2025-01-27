const errorHandling = require("../utils/errorHandling")
const { connection } = require("../db")
const {validateEmail}=require("../utils/emailValidator")
const {isValidNepaliPhoneNumber}=require("../utils/phNoValidation")
const bcrypt=require("bcryptjs")

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
// const query = `
//         CREATE TABLE IF NOT EXISTS users (
//             id INT AUTO_INCREMENT PRIMARY KEY,        
//             name VARCHAR(255) NOT NULL,               
//             email VARCHAR(255) UNIQUE NOT NULL,  
//             dob DATE NOT NULL,                         
//             gender ENUM('male', 'female', 'other') NOT NULL, 
//             address TEXT NOT NULL,
//             password VARCHAR(255) NOT NULL,           
//             phone VARCHAR(15) NOT NULL,  
//             role ENUM('user', 'admin') DEFAULT 'user', 
//             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//             updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
//         );

