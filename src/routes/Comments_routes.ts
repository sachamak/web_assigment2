import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";
import {authMiddleware} from "../controllers/auth_controller";

router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", commentsController.getById.bind(commentsController));

router.put("/:id",authMiddleware, commentsController.updateById.bind(commentsController));

router.delete("/:id",authMiddleware, commentsController.deleteById.bind(commentsController));

router.post("/",authMiddleware, commentsController.create.bind(commentsController));


export default router;
