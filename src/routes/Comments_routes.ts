import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";

router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", commentsController.getById.bind(commentsController));

router.put("/:id", commentsController.updateById.bind(commentsController));

router.delete("/:id", commentsController.deleteById.bind(commentsController));

router.post("/", commentsController.create.bind(commentsController));

router.post("/:id", commentsController.deleteById.bind(commentsController));

export default router;
