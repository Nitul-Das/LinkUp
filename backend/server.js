import express from "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authroutes from "./routes/auth.route.js"
import userroutes from "./routes/user.route.js"
import postroutes from "./routes/post.route.js"
import notificationroutes from "./routes/notification.route.js"

import connectDB from "./config/db.js";


dotenv.config()

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express()
const PORT = process.env.PORT || 5000;

app.use(express.json());// to parese req.body
app.use(express.urlencoded({ extended: true })); // to parse form data(urlencoded) in postman
app.use(cookieParser()); // it is package installed to get the tokken from cookies in protect routes


app.use("/api/auth", authroutes)
app.use("/api/users", userroutes)
app.use("/api/posts", postroutes)
app.use("/api/notifications", notificationroutes )

app.listen(PORT,()=>{
    connectDB()
    console.log("server running at http://localhost:" + PORT)
})