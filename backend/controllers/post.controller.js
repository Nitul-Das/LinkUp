import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async(req,res) =>{
    try {

        const { text } = req.body;
		let { img } = req.body;
		const userId = req.user._id.toString();

        const user = await User.findById(userId)
        if(!user) return res.status(404).json({message: "User not found"})

        if(!text && !img) {
            return res.status(400).json({error:"Post must have text or image"})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
			user: userId,
			text,
			img,
		});

		await newPost.save();
        res.status(201).json(newPost)

    } catch (error) {
        res.status(500).json({error: "Internal server error"})
        console.log("Error in createPost controller", error); 
    }
}

export const deletePost = async(req, res) =>{

    try {
        
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({error: "Post not found"})
        }
    
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(404).json({error: "You are not authorized to delete this post"})
        }
    
        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }
    
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Post deleted successfully" });

    }catch (error) {
		console.log("Error in deletePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const commentOnPost = async(req,res) =>{
    try {

        const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;

        if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

        const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

        // Create a Comment Object  
        const comment = { user: userId, text }; // Combine user ID and text

        // Add Comment to Post
		post.comments.push(comment);// Add the comment to the post's comments array

		await post.save();

		res.status(200).json(post);
        
    } catch (error) {
		console.log("Error in commentOnPost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export const likeUnlikePost = async(req,res) =>{
    try {
        const userId = req.user._id;
        const {id} = req.params;

        const post = await Post.findById(id);

        if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

        const userLikedPost = post.likes.includes(userId);

        if (userLikedPost) {
            //unlike post
            await Post.updateOne({ _id: id }, { $pull: { likes: userId } });
			res.status(200).json({message:"Post unliked successfully"})
            
        } else {
            // Like post
			post.likes.push(userId);
			await post.save();

			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			});
			await notification.save();

            res.status(200).json({message:"Post liked successfully"})

        }
        
    } catch (error) {
		console.log("Error in likeUnlikePost controller: ", error);
		res.status(500).json({ error: "Internal server error" });
	}
}









export const getAllPosts = () =>{
    
}
export const getFollowingPosts = () =>{

}
export const getLikedPosts = () =>{

}
export const getUserPosts = () =>{

}