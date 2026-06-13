import Post from "../Model/Post.model.js"
import User from "../Model/User.model.js"
import Comment from "../Model/Comment.model.js"
import sharp from "sharp"
import cloudinary from "../Utils/Cloudinary.js";
import { json } from "express";
//=====Add new Post =====
export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(400).json({
                message: "Image required",
                status:false
            });
        }

        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({
                width: 800,
                height: 800,
                fit: "inside",
            })
            .toFormat("jpeg", { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;

        const cloudResponse = await cloudinary.uploader.upload(fileUri);

        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId,
        });

        const user = await User.findById(authorId);

        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({
            path: "author",
            select: "-password",
        });

        return res.status(201).json({
            message: "New Post added",
             post,
             status:true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};
//=====Get All Post=====
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "author",
                select: "username profilePic"
            })
            .populate({
                path: "comments",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "author",
                    select: "username profilePic"
                }
            });

        return res.status(200).json({
            message: "Posts fetched successfully",
            posts,
            status:true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
//=====Get user Post=====
export const getUserPost = async (req, res) => {
    try {
        const userId = req.id;
        const post = await Post.find({ author: userId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username ,parofilepic'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            papulate: {
                path: 'author',
                select: 'username,profilepic'
            }
        });
        return res.status(200).json({
            message: "post fetch successfully",
         post,
         status:true
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};
//=====Like and unLike post=====
export const toggleLikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                status:false
            });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            await Post.findByIdAndUpdate(postId, {
                $pull: { likes: userId }
            });

            return res.status(200).json({
                message: "Post unliked",
                status:true
            });
        }

        await Post.findByIdAndUpdate(postId, {
            $addToSet: { likes: userId }
        });

        return res.status(200).json({
            message: "Post liked",
            status:true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
//===== Add Comment=====
export const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.id;
        const { text } = req.body;

        if (!text?.trim()) {
            return res.status(400).json({
                message: "Text is required",
                status:false
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const comment = await Comment.create({
            text,
            author: userId,
            post: postId
        });

        await comment.populate({
            path: "author",
            select: "username profilePic"
        });

        post.comments.push(comment._id);
        await post.save();

        return res.status(201).json({
            message: "Comment added successfully",
               comment,
               status:true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
//=====Get Comments of Post (particuler)=====
export const getcommentofPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId })
            .populate("author", "username profilePic");

        return res.status(200).json({
            message: "Comments fetched successfully",
            comments,
            status:true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
//=====Delete Post=====
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                status:false
            });
        }

        if (post.author.toString() !== authorId) {
            return res.status(403).json({
                message: "Unauthorized",
                status:false
            });
        }

        await Post.findByIdAndDelete(postId);

        const user = await User.findById(authorId);

        if (user) {
            user.posts = user.posts.filter(
                id => id.toString() !== postId
            );

            await user.save();
        }

        await Comment.deleteMany({
            post: postId
        });

        return res.status(200).json({
            message: "Post deleted successfully",
            status:true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
//=====Bookmarks post=====
export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                status:false
            });
        }

        const user = await User.findById(authorId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status:false
            });
        }

        const isBookmarked = user.bookmarks.some(
            id => id.toString() === postId
        );

        if (isBookmarked) {
            await User.findByIdAndUpdate(authorId, {
                $pull: { bookmarks: postId }
            });

            return res.status(200).json({
                message: "Post removed from bookmarks",
                status:true
            });
        }

        await User.findByIdAndUpdate(authorId, {
            $addToSet: { bookmarks: postId }
        });

        return res.status(200).json({
            message: "Post bookmarked",
            status:true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};