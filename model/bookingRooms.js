const { connection } = require("../db")

try {
    const createTable = () => {
        const query = `
            id INT AUTO_INCREMENT PRIMARY KEY,
            CREATE TABLE IF NOT EXISTS booking_rooms (
            booking_id INT NOT NULL,
            room_id INT NOT NULL,
            FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE

    );

        
      `
        connection.query(query, (error, result) => {
            if (error) return console.log("Cannot create a table.\n" + error)
            console.log(result)
        })

    }
    createTable()
} catch (error) {

    console.log(error)
}