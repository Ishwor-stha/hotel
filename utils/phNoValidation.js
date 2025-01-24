module.exports.isValidNepaliPhoneNumber = (phoneNumber) => {
    // Convert input to a string and remove spaces and hyphens
    const cleanPhoneNumber = String(phoneNumber).replace(/[-\s]/g, '');

    // Regular expression to match valid Nepali phone numbers
    const nepaliPhonePattern = /^(98\d{8}|97\d{8}|981\d{7}|980\d{7}|01-?\d{7})$/;

    
    return nepaliPhonePattern.test(cleanPhoneNumber);
};
