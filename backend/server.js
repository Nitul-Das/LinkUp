import express from "express";
import routes from "./routes/auth.route.js"
import dotenv from "dotenv"
import connectDB from "./config/db.js";

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000;

app.use(express.json());// to parese req.body
// limit shouldn't be too high to prevent DOS
 // to parse form data(urlencoded)

app.use("/api/auth", routes)

app.listen(PORT,()=>{
    connectDB()
    console.log("server running at http://localhost:" + PORT)
})