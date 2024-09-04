import { port } from "../index.js";
import User from "../models/User.js";
import fs from "fs";
import { imagePath } from "../routes/upload-image.js";
import ErrorResponse from "../utils/ErrorResponse.js";

export const uploadImage = async (req, res, next) => {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any

  const response = { location: `http://localhost:${port}/files/${req.file.filename}`, size: req.file.size };

  const userId = req.userId;
  const user = await User.findById(userId);

  if (user === null) return res.status(404).json({ error: "User not found", message: "User not found" });
  // console.log(user.profileImage);
  if (user.profileImage) {
    const oldImage = user.profileImage;
    // Remove the old image file
    if (oldImage) {
      const fileName = oldImage.split("/").slice(-1)[0]; // Get the file name from the URL
      // Check if the file exists in the directory
      fs.access(`${imagePath}${fileName}`, fs.constants.F_OK, (err) => {
        if (!err) {
          // Delete the file if it exists
          fs.unlink(`${imagePath}${fileName}`, (err) => {
            if (err) {
              console.log("Error deleting file:", err);
              throw new ErrorResponse("Error deleting file", 500);
            }
            console.log("Image file deleted successfully");
          });
        }
      });
    }
  }
  if (user) {
    user.profileImage = response.location;
    await user.save();
  }
  res.json(response);
};

export function imageValidation(req, res, next) {
  // console.log("Image validation: ", req);
  const imageFile = req.file;
  // console.log("Image validation: ", imageFile);
  if (imageFile === undefined) return res.status(400).json({ error: "File not found", message: "Please select file to upload" });
  if (imageFile.mimetype.split("/")[0] !== "image") return res.status(400).json({ error: "Non image", message: "File is not an image" });
  if (imageFile.size > 1000000) return res.status(400).json({ error: "Too large", message: "File is too large. Max size is 1MB" });

  next();
}
