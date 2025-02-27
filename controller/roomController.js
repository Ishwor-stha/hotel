const errorHandling = require("../utils/errorHandling");
const {
    connection
} = require("../db");
module.exports.createRoom = async (req, res, next) => {
    try {
    	if(!req.body ||Object.keys(req.body).length ===0)return next(new errorHandling(400,"Empty body please send data ."))
    	const possibleFields=["room_type","price_per_night","capacity","features","images"]
    	const checkFields=Object.keys(req.body).filter(field=> !possibleFields.includes(field) || !req.body[field] );
    	console.log(checkFields)
        if(checkFields.length!==0)return next(new errorHandling(400,`${checkFields} ${checkFields.length===1?"is":"are"} missing.Please fill out the all form.`));
        let  questionMark=[]
        const values=possibleFields.map(field=>{
        	questionMark.push("?")
        	return req.body[field]
        })

		const query=`INSERT INTO rooms(${possibleFields.join(",")} VALUES (${questionMark.join(",")})` //ie INSERT INTO rooms(room_type,price_per_night,capacity,features,images VALUES (?,?,?,?,?
		//  console.log(values);
		// console.log(query);
		// const upload=await connection.promise().query(query,values);

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