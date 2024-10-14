import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokens.js";

export const signup = async (req, res) => {
  
try {
    const { fullName, username, email, password } = req.body;

    //It checks if the email the user entered is in the correct format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // hash password

    const salt = await bcrypt.gensalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating a new user
    const newUser = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res); // Create a login token and store it in a cookie for the user
      await newUser.save(); // Save the new user to the database

      res.status(201).json({ // Send back the new user's info, but not the password
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  res.send("login korba parbi de");
};

export const logout = async (req, res) => {
  res.send("ulu  er pai");
};
