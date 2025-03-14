const { connection } = require("../db");

const createTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS bookingRooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            bookingId INT NOT NULL,
            userId INT NOT NULL,
            room_id INT NOT NULL,

            FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL
        );
    `;

    connection.query(query, (error, result) => {
        if (error) {
            console.log("Cannot create a table.\n" + error);
            return;
        }
        console.log("Table created successfully:", result);
    });
};


createTable();
