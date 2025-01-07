import mongoose from "mongoose";

export interface iComment {
  _id?: string;
  content: string;
  postId: string;
  owner: string;
}

const commentsSchema = new mongoose.Schema<iComment>({
  content: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    required: true,
  },
});

const commentsModel = mongoose.model<iComment>("comments", commentsSchema);

export default commentsModel;
