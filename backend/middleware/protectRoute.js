import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

// protectRoute middleware is designed to be reusable across multiple routes.

export const protectRoute = async (req, res, next)=>{
    try {
        const token = req.cookies.jwt; //gets the JSON Web Token (JWT) from the cookie using the cookie-parser package.
        if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}

        const decoded = jwt.verify(token, process.env.JWT_SECRET); //verifies the JWT with the secret key.

		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

        const user = await User.findById(decoded.userId).select("-password"); //fetches the user from the database using the ID found in the JWT

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user; //adds the user information to the request, making it available for later use in other route handlers.
		next();
        
    } catch (error) {
        console.log("Error in protectRoute middleware", error.message);
		return res.status(500).json({ error: "Internal Server Error" });      
    }
};