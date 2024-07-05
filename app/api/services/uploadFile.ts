"use server"
import { imagekit } from "@/lib/utils";

const getBufferImage = async(fileInfo: File) => {
  try {
    const bytes = await fileInfo.arrayBuffer();
    const bufferImage = Buffer.from(bytes);
    return bufferImage;
  } catch (error) {
    throw error
  }
}

export const uploadImage = async(fileInfo: File, fileName: string) => {
  try {
    const bufferImage: Buffer = await getBufferImage(fileInfo);
    const result = await imagekit.upload({
      file: bufferImage, 
      fileName: fileName, 
    });
    return result;
  } catch (error) {
    throw error;
  }
}

export const deleteFiles = async (files: string[]) => {
  try {
    imagekit.bulkDeleteFiles(files);
    return 
  } catch (error) {
    throw error
  }
}
