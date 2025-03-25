const errorHandling = require("../utils/errorHandling");
const {
    connection
} = require("../db");
const mysql=require("mysql2")
module.exports.createRoom = async (req, res, next) => {
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You do not have enough permission to perform this task."));

        if (!req.body || Object.keys(req.body).length === 0) return next(new errorHandling(400, "Empty body please send data ."))
        const possibleFields = ["hotel_id", "room_type", "price_per_night", "capacity", "features", "image", "availability"]
        const bodyField = Object.keys(req.body)
        const checkFields = possibleFields.filter(field => !bodyField.includes(field) || !req.body[field]);
        // console.log(checkFields)
        if (checkFields.length !== 0) return next(new errorHandling(400, `${checkFields} ${checkFields.length === 1 ? "is" : "are"} missing.Please fill out the all form.`));
        let questionMark = []
        const values = possibleFields.map(field => {
            questionMark.push("?")
            return req.body[field]
        })
        // console.log(possibleFields.join(","));
        // console.log(questionMark.join(","));
        // console.log(values);

        const query = `INSERT INTO rooms(${possibleFields.join(",")}) VALUES (${questionMark.join(",")})` //ie INSERT INTO rooms(room_type,price_per_night,capacity,features,images VALUES (?,?,?,?,?)
        // console.log(query)
        const uploadRoomData = await connection.promise().query(query, values);
        if (uploadRoomData[0]["affectedRows"] === 0) return next(new errorHandling(500, "Cannot upload the data.Please try again later."))

        res.status(200).json({
            status: true,
            message: "Room created sucessfully."
        })
    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }
}

module.exports.updateRoom = async (req, res, next) => {
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You do not have enough permission to perform this task."));
        const roomId = req.params.roomId
        if (!roomId || roomId.trim() === "") return next(new errorHandling(400, "No room id is given to update."))
        if (isNaN(Number(roomId))) return next(new errorHandling(400, "Room id must be a number"))

        if (!req.body || Object.keys(req.body).length === 0) return next(new errorHandling(400, "Empty body please send data ."))
        const possibleFields = ["room_type", "price_per_night", "capacity", "features", "images"]
        const checkFields = Object.keys(req.body).filter(field => possibleFields.includes(field) || req.body[field]);
        if (checkFields.length == 0) return next(new errorHandling(400, "No data to update."))
        const values = []
        const fieldName = checkFields.map(field => {
            values.push(req.body[field])
            return `${field}=?`
        })
        // inserting the room id in values array
        fieldName.push("updated_at=?")
        values.push(mysql.raw("CURRENT_TIMESTAMP"))
        values.push(roomId)
        // console.log(values );
        const updateQuery = `UPDATE rooms SET ${fieldName.join(',')} WHERE id=?`
        const updateRoom = await connection.promise().query(updateQuery, values)
        // console.log(updateRoom)
        if (updateRoom[0]["affectedRows"] === 0) return next(new errorHandling(500, "Cannot update the data.Please try again later."))

        res.status(200).json({
            status: true,
            message: "Room updated sucessfully."
        })
    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }
}
module.exports.getAllRooms = async (req, res, next) => {
    try {
        let dbQuery = "SELECT * FROM rooms";
        // const queryParams = [];
        
        if (req.query.price && ["asc", "desc"].includes(req.query.price.toLowerCase())) {
            dbQuery = `SELECT * FROM rooms ORDER BY price_per_night ${req.query.price.toUpperCase()}`  
        }
        // console.log(dbQuery)
        
        const [rooms] = await connection.promise().query(dbQuery);

        if (rooms.length === 0) {
            return next(new errorHandling(404, "There are no rooms available in the database."));
        }

        res.status(200).json({
            status: true,
            totalRooms: rooms.length,
            message: "Rooms fetched successfully.",
            rooms
        });

    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message));
    }
};



module.exports.getRoomById = async (req, res, next) => {
    try {
        const roomId = req.params.roomId;
        if (!roomId || isNaN(Number(roomId))) return next(new errorHandling(400, "Invalid room id."));
        const query = `SELECT * FROM rooms WHERE id=?`
        const [room] = await connection.promise().query(query, [roomId])
        // console.log(room)
        if (room.length === 0) return next(new errorHandling(404, "No room found from ."))
        res.status(200).json({
            status: "true",
            message: "Room fetched sucessfully.",
            roomDetails: room[0]

        })

    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))
    }
}


module.exports.deleteRoomById = async (req, res, next) => {
    try {
        if (req.user.role !== process.env.arole) return next(new errorHandling(401, "You are not authorized to perform this task."))
        const roomId = req.params.roomId;
        if (!roomId || isNaN(Number(roomId))) return next(new errorHandling(400, "Invalid room id."));
        const query = `DELETE FROM rooms WHERE id=?`
        const deleteRoom = await connection.promise().query(query, [roomId])
        if (deleteRoom[0]["affectedRows"] === 0) return next(new errorHandling(500, "Cannot delete the room.Please try again later."))
        res.status(200).json({
            status: "true",
            message: "Room deleted sucessfully."

        })

    } catch (error) {
        return next(new errorHandling(error.statusCode || 500, error.message))

    }
}