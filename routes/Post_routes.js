
const express = require('express');
const router = express.Router();
const Post = require("../controllers/post_contoller");

router.get("/", (req, res) => {
    if (req.query.owner) {
        return Post.getPostsByOwner(req, res); 
    } else {
        return Post.getAllPosts(req, res); 
    }
});

router.put("/:id", Post.updatePostById);

router.get("/:id", Post.getPostById);

router.delete("/:id", Post.DeletePostById);

router.post("/", (req, res) => {
Post.createPost(req, res);
});

module.exports = router;