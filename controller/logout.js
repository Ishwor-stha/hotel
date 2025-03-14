const jwt = require("jsonwebtoken")
const errorHandling = require("../utils/errorHandling")
// @method DELETE
// @desc:controller delete cookie from the user
// @endpoint: localhost:4000/api/logout
module.exports.logout = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) return next(new errorHandling(403, "Please login first."));
        const check = jwt.verify(token, process.env.jwt_secret_key);

        // if token verification fails
        if (!check) return next(new errorHandling(400, "Invalid token given.Please clear the browser and login again."));
        //clear the cookie from browser
        res.clearCookie('auth_token', {
            httpOnly: true,
            sameSite: "Strict"
        });
        return res.status(200).json({
            status: true,
            message: "You have been logged out."
        });
    } catch (error) {
        return next(new errorHandling(500, error.message));
    }
}