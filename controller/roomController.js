const errorHandling = require("../utils/errorHandling");
const {
    connection
} = require("../db");
module.exports.createRoom = async (req, res, next) => {
    try {
    	const possibleFields=["room_type","price_per_night","capacity","features","images"]
        res.status(200).json({
            status: true,
            message: "success"
        })
    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }
}


// id              | int           | NO   | PRI | NULL              | auto_increment                                |
// | hotel_id        | int           | NO   | MUL | NULL              |                                               |
// | room_type       | varchar(50)   | NO   |     | NULL              |                                               |
// | price_per_night | decimal(10,2) | NO   |     | NULL              |                                               |
// | capacity        | int           | NO   |     | NULL              |                                               |
// | features        | text          | YES  |     | NULL              |                                               |
// | availability    | tinyint(1)    | YES  |     | 1                 |                                               |
// | created_at      | timestamp     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED                             |
// | updated_at      | timestamp     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
// | image