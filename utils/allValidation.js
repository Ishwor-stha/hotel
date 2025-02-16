const {
    validateEmail
} = require("./emailValidator")
const {
    isValidNepaliPhoneNumber
} = require("./phNoValidation")
const errorHandling = require("./errorHandling")

module.exports.doValidations = (email, phone, phone2, password, confirmPassword) => {
    if (!validateEmail(email)) {
        return `Please enter a valid email address`
    }
    if (!isValidNepaliPhoneNumber(phone)) {
        return `Please enter a valid phone number`
    }
    if (!isValidNepaliPhoneNumber(phone2)) {
        return "Please enter a valid phone number"
    }
    if (phone === phone2) {
        return "The phone numbers are the same.Both phone number must be different."
    }
    if (password !== confirmPassword) {
        return  "Password and confirm password do not match"
    }

    
    return null;
};
