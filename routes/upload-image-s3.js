import { Router } from "express";
import { uploadImageS3, imageValidation } from "../middleware/upload-image-s3.js";
import multer from "multer";

export const imagePath = "./public/imageUploads/";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

// Configure multer storage (memory storage for buffering)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 1000000 } });
const uploadImageS3Router = Router();

uploadImageS3Router.route("/").post(verifyTokenMiddleware, upload.single("image"), imageValidation, uploadImageS3);

export default uploadImageS3Router;
