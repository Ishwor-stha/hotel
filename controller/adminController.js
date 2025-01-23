const { connection } = require("../db")
const errorHandling=require("../utils/errorHandling")
module.exports.getAll = async(req, res, next) => {
    try {
        const query = `SELECT * FROM admin`
        let [data] =await connection.promise().query(query)
        console.log(data)
        res.status(200).json({
            "status": true,
            "message": "worked"
        })

    } catch (error) {
        return res.status(500).json({
            "status": false,
            "messsage": error.message || "Something went wrong"
        })
    }

}

module.exports.createAdmin=(req,res,next)=>{
    try {
        const {name,email,phone,password,confirmPassword}=req.body
        if(!name || !email || !phone || !password || !confirmPassword) return next(new errorHandling(400,"All fields are required."))
        if(password !==confirmPassword)return next(new errorHandling(400,"Password doesnot match with confirm password."))
        } catch (error) {
        return res.status(500).json({
            "status":false,
            "message":error.message ||"Something went wrong."
        })
    }

}