const {
    connection
} = require("../db")
try {
    const createTable = () => {
        const query = `
            CREATE TABLE IF NOT EXISTS admin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(30) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(20) NOT NULL,
            phone2 VARCHAR(15) NULL,  
            role ENUM('admin') DEFAULT 'admin',  
            password VARCHAR(255) NOT NULL,
            dob DATE NOT NULL,
            gender ENUM('male', 'female', 'other') NOT NULL,
            address TEXT NOT NULL,
            country VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            zip VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
            updated_at TIMESTAMP NULL
            );
        `
        connection.query(query, (error, result) => {
            console.log(error)
            if (error) return console.log("Cannot create a table.\n" + error)
            console.log(result)
        })
    }
    createTable()
} catch (error) {
    console.log(error)
}