const { connection } = require("../db")

try {
  const createTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS hotels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          location VARCHAR(100)  NOT NULL, 
          description TEXT NOT NULL, 
          image VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NULL
                    
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