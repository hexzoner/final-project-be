import { Router } from "express";
import { uploadImage, imageValidation } from "../middleware/upload-image.js";
import multer from "multer";
export const imagePath = "./public/imageUploads/";
import verifyTokenMiddleware from "../middleware/verifyToken.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagePath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage, limits: { fileSize: 1000000 } });
// const upload = multer({ dest: "uploads/" });
const uploadImageRouter = Router();

uploadImageRouter.route("/").post(verifyTokenMiddleware, upload.single("image"), imageValidation, uploadImage);

export default uploadImageRouter;
