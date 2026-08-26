"use server"
import { imagekit } from "@/lib/utils";

const getBufferImage = async(fileInfo: File) => {
  try {
    if (!fileInfo || typeof fileInfo.arrayBuffer !== "function") throw new Error("A valid file is required.");
    const bytes = await fileInfo.arrayBuffer();
    const bufferImage = Buffer.from(bytes);
    return bufferImage;
  } catch (error) {
    throw error
  }
}

export const uploadImage = async(fileInfo: File, fileName: string, folder?: string) => {
  try {
    if (!fileInfo || typeof fileInfo.arrayBuffer !== "function") throw new Error("A valid file is required.");
    if (!fileName?.trim()) throw new Error("A file name is required.");
    const bufferImage: Buffer = await getBufferImage(fileInfo);
    const result = await imagekit.upload({
      file: bufferImage, 
      fileName: fileName, 
      folder: folder || "AdminNextloop",
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export const getTransformedUrl = (url: string) => {
  if (!url?.trim()) throw new Error("A file URL is required.");
    return imagekit.url({
      src: url,
      transformation: [
        {
          height: "400",
          crop: "maintain_ratio",
        },
      ],
    });
}


export const deleteFiles = async (files: string[]) => {
  try {
    if (!Array.isArray(files) || !files.length || files.some(file => !file?.trim())) throw new Error("At least one valid file id is required.");
    await imagekit.bulkDeleteFiles(files);
    return;
  } catch (error) {
    throw error;
  }
}
