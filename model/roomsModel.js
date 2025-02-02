const { connection } = require("../db")

try {
    const createTable = () => {
        const query = `
        CREATE TABLE IF NOT EXISTS rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,         
            hotel_id INT NOT NULL,                    
            room_type VARCHAR(50) NOT NULL,           
            price_per_night DECIMAL(10, 2) NOT NULL, 
            capacity INT NOT NULL,                   
            features TEXT,                           
            availability BOOLEAN DEFAULT TRUE,         
            FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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