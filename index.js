const express=require("express")
const app=express()
const dotenv=require("dotenv")
const {connect}=require("./db")
const adminRoute=require("./routes/adminRoute")
const errorController = require("./controller/errorController")
dotenv.config()
connect()
app.use(express.json())

app.use("/api/admin/",adminRoute)

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
    console.log(`Server is listening on port ${port}.`)
})