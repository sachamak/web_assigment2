import commentsModel from "../models/comments_model";
import BaseController from "./base_controller";

const commentsController = new BaseController(commentsModel);

export default commentsController;
