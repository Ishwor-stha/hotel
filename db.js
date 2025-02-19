const mysql = require("mysql2");
const kleur = require("kleur")
const dotenv=require("dotenv");
dotenv.config()
// Create a connection to the database
const connection = mysql.createConnection({
   
    host: process.env.host,
    user: process.env.user,
    password: process.env.password, //  MySQL password
    database: process.env.database, //MySQL database name
});
// Connect to MySQL
const connect = () => {
    connection.connect((err) => {
        if (err) {
            console.error(kleur.red().italic(`Error connecting to the database: ${err.stack}`));
            return;
        }
        console.log(kleur.green().italic("Connected to the MySQL database"));
    });
}
module.exports = {
    connection,
    connect
};