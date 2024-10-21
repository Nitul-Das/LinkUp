import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = async(req, res)=>{
    const { username } = req.params; // Extracts the username from the request parameters.

	try {
		const user = await User.findOne({ username }).select("-password"); // Searches for the user in the database, excluding the password.
		if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
		res.status(200).json(user);  // Sends back the user profile with a 200 status if found.
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async(req, res) =>{
    try {
		const { id } = req.params; // Extracts the target user ID from the request parameters.
		const userToModify = await User.findById(id); // Finds the user to follow/unfollow based on the ID.
		const currentUser = await User.findById(req.user._id); // Gets the current user from the database.

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id); // Checks if the current user is already following the target user.

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }); // Removes the current user from the target user's followers list.
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }); // Removes the target user from the current user's following list.
			res.status(200).json({ message: "User unfollowed successfully" });
			
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }); // Adds the current user to the target user's followers list.
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }); // Adds the target user to the current user's following list.
			
			// Creates a new follow notification linking the current user (from) to the user they are following (to).
        
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,
			});

			// Saves the notification to the database and sends a success message back.

			await newNotification.save();
			res.status(200).json({ message: "User followed successfully" });
		}

    } catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async(req,res)=>{
	try {

		// Get the current user's ID from the request.
		const userId = req.user._id;

		//Find the users that the current user is following.

		const usersFollowedByMe = await User.findById(userId).select("following");
         
		// Find random users who are not the current user.
		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },// Exclude the current user
				},
			},
			{ $sample: { size: 10 } },// Select 10 random users
		]);

		// Filter out users that the current user is already following.
		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		
		// Get the first 4 suggested users.
		const suggestedUsers = filteredUsers.slice(0, 4);

        // Remove the password from the suggested users.
		suggestedUsers.forEach((user) => (user.password = null));

        // Send the suggested users as a response.
		res.status(200).json(suggestedUsers);

	} catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const updateUser = async(req,res)=>{
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {

		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);

		}


		
	} catch (error) {
		
	}


}