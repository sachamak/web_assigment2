import express from "express";
const router = express.Router();
import postController from "../controllers/posts_controller";
import {authMiddleware} from "../controllers/auth_controller";

router.post("/",authMiddleware, postController.create.bind(postController));

router.get("/", postController.getAll.bind(postController));

router.get("/:id", postController.getById.bind(postController));

router.put("/:id",authMiddleware, postController.updateById.bind(postController));

router.delete("/:id",authMiddleware, postController.deleteById.bind(postController));

export default router;
