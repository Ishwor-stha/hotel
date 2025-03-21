const validator = require("validator");


module.exports.validateEmail = (email) => {
    const isEmail = validator.isEmail(email);
    const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com","ymail.com","icloud.com","protonmail.com","edu"];
    const emailDomain = email.split('@')[1];
    if(!emailDomain )return false
    return isEmail && allowedDomains.includes(emailDomain) || emailDomain.endsWith(".edu");;
};