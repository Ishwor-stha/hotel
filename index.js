const express=require("express")
const app=express()
const dotenv=require("dotenv")
const path=require("path")
const kleur=require("kleur")
const cookieParser=require("cookie-parser")
const {connect}=require("./db")
const adminRoute=require("./routes/adminRoute")
const userRoute=require("./routes/userRoute")
const bookingRoute=require("./routes/bookingRoute")
const errorController = require("./controller/errorController")
const logout=require("./routes/logoutRoute")
const roomRoute=require("./routes/roomRoute")
const paymentRoute=require("./routes/paymentRoute")
const hotelRoute=require("./routes/hotelRoute")
const ratingRoute=require("./routes/ratingRoutes")

const session=require("express-session")
dotenv.config()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
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
app.use("/api/user/booking",bookingRoute)
app.use("/api/user/payment",paymentRoute)
app.use("/api/hotel",hotelRoute)
app.use("/api/rooms",roomRoute)
app.use("/api/rating",ratingRoute)





connect()
//Handle any unhandled routes with a 404 error
app.all("*", (req, res) => {
    // console.log(req.originalUrl)
    res.status(404).json({
        status: "fail",
        message: "Invalid website path"
    });
});

app.use(errorController)

const port=process.env.SERVER_PORT ||4000
app.listen(port,()=>{
    console.log(kleur.blue().italic(`Server is listening on port ${port}.`))
    console.log(kleur.blue().italic(`URL=http://localhost:${port}/`))

})