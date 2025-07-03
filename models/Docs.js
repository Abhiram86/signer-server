import mongoose from "mongoose";

const { Schema } = mongoose;

const docsSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  file: {
    data: Buffer,
    contentType: String,
  },
  uploadTime: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Docs", docsSchema);
