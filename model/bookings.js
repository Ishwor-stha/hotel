const { connection } = require("../db")

try {
    const createTable = () => {
        const query = `
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,            
            user_id INT NOT NULL,                         
            room_id INT NOT NULL,                         
            hotel_id INT NOT NULL,                        
            check_in_date DATE NOT NULL,                  
            check_out_date DATE NOT NULL,                 
            guests INT NOT NULL,                          
            total_price DECIMAL(10, 2) NOT NULL,          
            booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
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