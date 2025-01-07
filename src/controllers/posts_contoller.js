
Post = require("../models/posts_model.js");

const getAllPosts = async (req, res) => {
    try {
        const post = await Post.find();
        if(!post){
            return res.status(404).send({ error: "Posts not found" });
        }
        return res.status(200).send(post);
    } catch (err) {
        return res.status(500).send({ error: err.message });
    }
};

const getPostsByOwner = async (req,res) => {
    const ownerfilter = req.query;
    if(!ownerfilter.owner){
        return res.status(404).send({ error: "Owner filter is required" });
    }
    try {
        const Posts = await Post.find({owner:ownerfilter.owner});
        if(!Posts){
            return res.status(404).send({ error: "Post not found" });
        }
    return res.status(201).send(Posts);
    } catch (err) {
        return res.status(400).send(err.message);
    }
};

const getPostById = async (req, res) => {
    const idfilter = req.params.id;
    if (!idfilter) {
        return res.status(400).send({ error: "Post ID is required" });
    }
    try{
        const Posts = await Post.findById(idfilter);
        if(!Posts){
            return res.status(404).send({ error: "Post not found" });
        }
        return res.status(201).send(Posts);
    } catch(err){
        return res.status(400).send(err.message);
    }
   };

   const updatePostById = async (req, res) => {
    const idfilter = req.params.id; 
    const updateData = req.body; 
    if (!idfilter) {
        return res.status(400).send({ error: "Post ID is required" });
    }
    try {
        const updatedPost = await Post.findByIdAndUpdate(idfilter, updateData);
        if (!updatedPost){
            return console.log("The Post ID is not valid");
        }
        return res.status(200).send(updatedPost);
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

const DeletePostById = async (req, res) => {
    const idfilter = req.params.id;
    if (!idfilter) {
        console.log("No ID provided");
        return res.status(400).send({ error: "Post ID is required" });
    }
    try {
        const posts = await Post.findByIdAndDelete(idfilter);
        console.log("Deleted Post:", posts);
        if (!posts) {
            console.log("Post not found");
            return res.status(404).send({ error: "Post ID is not valid" });
        }
        return res.status(200).send(posts);
    } catch (err) {
        console.error("Error during delete action:", err);
        return res.status(500).send({ error: "An unexpected error occurred." });
    }
};



const createPost = async (req, res) => {
    try {
        const post = await Post.create(req.body);
        if(!post){
            return res.status(404).send({ error: "One of the fields is invalid" });
        }
        res.status(201).send(post);
    } catch(err) {
        res.status(400).send(err.message);
    }
    };

   module.exports = {getAllPosts, createPost, DeletePostById, getPostById, getPostsByOwner, updatePostById};