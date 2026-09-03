import cloudinary from "../config/cloudinary.js";

// Upload to Cloudinary
export const uploadToCloudinary = async (
  fileBuffer,
  mimetype,
  folder = "learnora",
) => {
  try {
    const base64String = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    throw new Error("Failed to upload image");
  }
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    throw new Error("Failed to delete image");
  }
};
