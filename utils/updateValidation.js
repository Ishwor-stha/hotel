const {validateEmail}=require("./emailValidator")
const {isValidNepaliPhoneNumber}=require("./phNoValidation")
module.exports.updateValidation = (email, phone, phone2, password, confirmPassword) => {

    if (email !==undefined) {
        if (!validateEmail(req.body["email"])) return "Please enter valid email address."
    }
    if (phone !==undefined) {
        if (!isValidNepaliPhoneNumber(phone)) return "Please enter valid phone number."
    }
    if (phone2 !==undefined) {
        if (!isValidNepaliPhoneNumber(phone2)) return "Please enter valid phone number."
    }
    if (password !==undefined) {
        if (password !== confirmPassword) return "Password doesnot match with confirm password."
        
    }
}