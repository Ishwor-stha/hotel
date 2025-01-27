const { connection } = require("../db");

try {
    const createTable = () => {
        const query = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,        
            name VARCHAR(255) NOT NULL,               
            email VARCHAR(255) UNIQUE NOT NULL,  
            dob DATE NOT NULL,                         
            gender ENUM('male', 'female', 'other') NOT NULL, 
            address TEXT NOT NULL,
            password VARCHAR(255) NOT NULL,           
            phone VARCHAR(15) NOT NULL,  
            role ENUM('user', 'admin') DEFAULT 'user', 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
        );
        `
        connection.query(query, (error, result) => {
            if (error) return console.log("Cannot create a table.\n" + error);
            console.log(result);
        });
    };
    createTable();
} catch (error) {
    console.log(error);
}
