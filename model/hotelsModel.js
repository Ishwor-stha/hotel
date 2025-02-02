const { connection } = require("../db")

try {
  const createTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS hotels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(10)  NOT NULL, 
          description TEXT NOT NULL, 
          rating FLOAT CHECK (rating BETWEEN 0 AND 5),
          image VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    
        )
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