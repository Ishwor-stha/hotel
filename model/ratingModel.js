const {connection}=require("../db")
console.log(connection.password);

try {
    const create = () => {
        const query = `CREATE TABLE ratings (
        rating_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        hotel_id,
        score INT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (hotel_id) REFERENCES hotels(id)

    );`
        connection.query(query, (error, result) => {
            if (error) return console.log("Cannot create a table.\n" + error)
            console.log(result)
        })
    }
    create()
} catch (error) {
    console.log("Error creating rating table.");
    console.log(error);
}