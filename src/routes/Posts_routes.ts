import express from "express";
const router = express.Router();
import postController from "../controllers/posts_controller";

router.post("/", postController.create.bind(postController));

router.get("/", postController.getAll.bind(postController));

router.get("/:id", postController.getById.bind(postController));

router.put("/:id", postController.updateById.bind(postController));

router.delete("/:id", postController.deleteById.bind(postController));

export default router;
