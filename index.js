const express=require("express")
const app=express()
const dotenv=require("dotenv")
const kleur=require("kleur")
const cookieParser=require("cookie-parser")
const {connect}=require("./db")
const adminRoute=require("./routes/adminRoute")
const userRoute=require("./routes/userRoute")
const errorController = require("./controller/errorController")
const logout=require("./routes/logoutRoute")
const session=require("express-session")
dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60,
        httpOnly: true,
    },
}));
app.use("/api/admin/",adminRoute)
app.use("/api/user/",userRoute)
app.use("/api/",logout)



connect()
//Handle any unhandled routes with a 404 error
app.all("*", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: "Invalid website path"
    });
});

app.use(errorController)

const port=process.env.PORT ||4000
app.listen(port,()=>{
    console.log(kleur.blue().bold(`Server is listening on port ${port}.`))
})


//  How Foreign Keys are Passed Internally
// a) From users Table (user_id)

//     The user_id is typically stored in the session or JWT token upon login.
//     The backend retrieves it automatically from the session context when processing the request.

// b) From hotels Table (hotel_id)

//     The hotel_id comes from the user's selection on the frontend (e.g., choosing a hotel from a dropdown or list).

// c) From rooms Table (room_id)

//     The room_id comes from the user's selection on the frontend, often after they choose a hotel. The available rooms are fetched dynamically based on the selected hotel.