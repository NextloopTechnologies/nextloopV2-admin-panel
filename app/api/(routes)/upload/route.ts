import { UploadFileService } from "../..";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        
        const imageInfo: File | undefined = formData.get('file') as unknown as File;
        
        if (imageInfo === null) return Response.json({ msgText: "File is required!" }, { status: 400 })

        const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name);

        if (fileId) return Response.json({ success: true, data: { fileId, url }, msgText: "Uploaded!" }, { status: 201 });
        return Response.json({ success: false, msgText: "Failed to upload!" }, { status: 500 });
    } catch (error) {
        console.error("FILE_UPLOAD_CONTROLLER", error)
        return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
    }
}