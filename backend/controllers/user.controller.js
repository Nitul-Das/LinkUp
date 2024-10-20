import User from "../models/user.model.js";

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
			// Send notification to the user
			res.status(200).json({ message: "User followed successfully" });

			
		}

        
    } catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
}