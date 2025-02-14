const {
    validateEmail
} = require("./emailValidator")
const {
    isValidNepaliPhoneNumber
} = require("./phNoValidation")
const errorHandling = require("./errorHandling")

const doValidations=(next,email,phone,phone2,password,confirmPassword)=>{
	if (!validateEmail(email)) return next(new errorHandling(400,"Please enter a valid email address"));
        //phone no validation
        if (!isValidNepaliPhoneNumber(phone)) return next(new errorHandling(400,"Please enter a valid phone number."));

        if (!isValidNepaliPhoneNumber(phone2)) return next(new errorHandling(400,"Please enter a valid phone number."));
        if(phone===phone2) return next(new errorHandling(400,"The phone numbers are same.Please enter different phone numbers"));
        // check password and confirm password matches
        if (password !== confirmPassword) return next(new errorHandling(400,"Password and confirm password do not match"));
}