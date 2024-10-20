import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";

import authroutes from "./routes/auth.route.js"
import userroutes from "./routes/user.route.js"

import connectDB from "./config/db.js";


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000;

app.use(express.json());// to parese req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded) in postman
app.use(cookieParser()); // it is package installed to get the tokken from cookies in protect routes


app.use("/api/auth", authroutes)
app.use("/api/users", userroutes)

app.listen(PORT,()=>{
    connectDB()
    console.log("server running at http://localhost:" + PORT)
})