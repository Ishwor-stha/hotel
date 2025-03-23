const mysql = require("mysql2");
const kleur = require("kleur")
const dotenv=require("dotenv");
dotenv.config()
// Create a connection to the database
// console.log(process.env.PASSWORD)
//  console.log(process.env.HOST);
//  console.log(process.env.DATABASE_USER);
//  console.log(process.env.DATABASE );
const connection = mysql.createConnection({
   
    host: process.env.HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD, //  MySQL password
    database: process.env.DATABASE, //MySQL database name
    port:process.env.DB_PORT
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