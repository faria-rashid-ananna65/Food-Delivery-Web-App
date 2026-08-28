import imagekit from "../config/imagekit.js";

export const uploadImage = async (file, folder = "food-delivery") => {
  try {
    const base64 = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64}`;

    const response = await imagekit.upload({
      file: dataURI,
      fileName: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      folder,
      transformation: {
        quality: "80",
        format: "webp",
      },
    });

    return response.url;
  } catch (error) {
    console.error("ImageKit upload error:", error.message);
    throw new Error("Image upload failed: " + error.message);
  }
};

export const deleteImage = async (imageUrl) => {
  try {
    const urlParts = new URL(imageUrl).pathname.split("/");
    const fileName = decodeURIComponent(urlParts[urlParts.length - 1]);

    const searchResult = await imagekit.listFiles({
      searchQuery: `name="${fileName}"`,
    });

    if (searchResult.length > 0) {
      await imagekit.deleteFile(searchResult[0].filePath);
    }
  } catch (error) {
    console.error("ImageKit delete error:", error.message);
  }
};
