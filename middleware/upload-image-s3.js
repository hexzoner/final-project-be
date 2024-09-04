import User from "../models/User.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ErrorResponse from "../utils/ErrorResponse.js";

const s3 = new S3Client({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export function imageValidation(req, res, next) {
  // console.log("Image validation: ", req);
  const imageFile = req.file;
  // console.log("Image validation: ", imageFile);
  if (imageFile === undefined) return res.status(400).json({ error: "File not found", message: "Please select file to upload" });
  if (imageFile.mimetype.split("/")[0] !== "image") return res.status(400).json({ error: "Non image", message: "File is not an image" });
  if (imageFile.size > 1000000) return res.status(400).json({ error: "Too large", message: "File is too large. Max size is 1MB" });

  next();
}

export async function uploadImageS3(req, res, next) {
  {
    if (!req.file) throw new ErrorResponse("No file uploaded", 400);

    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) throw new ErrorResponse("User not found", 404);

    try {
      const randomFileName = crypto.randomUUID();
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME, // Bucket name
        Key: `${randomFileName}-${req.file.originalname}`, // File name with random string prefix
        Body: req.file.buffer, // File buffer
        ContentType: req.file.mimetype, // MIME type
        // ACL: "public-read", // Access control (optional)
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      // Generate a signed URL for the uploaded file
      //   const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;

      // Remove the old image file
      if (user.profileImage) {
        const oldImage = user.profileImage;
        const imageKey = oldImage.split("/").pop();

        // try {
        const deleteParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: imageKey,
        };

        if (!deleteParams.Bucket || !deleteParams.Key) {
          throw new ErrorResponse("Invalid S3 delete parameters", 400);
        }

        await s3.send(new DeleteObjectCommand(deleteParams));
        console.log(`Deleted old image: ${imageKey} from S3`);
        // } catch (error) {
        //   console.error("Error deleting old image from S3:", error);
        //   return res.status(500).send("Error deleting old image.");
        // }
      }

      // Save the URL to the user's profileImage field
      user.profileImage = url;
      await user.save();

      res.send({
        imageUrl: url,
      });
    } catch (error) {
      console.error("Error uploading to S3:", error);
      res.status(500).send("Error uploading file.");
    }
  }
}
