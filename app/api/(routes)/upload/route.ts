import { UploadFileService } from "../..";

export async function OPTIONS() {
    // Handle OPTIONS request
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Origin': '*', // Adjust this in production
            'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
            'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
        }
    });
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        
        const folder = (formData.get('folder') || 'AdminNextloop') as string;
        const imageInfo: File | undefined = formData.get('file') as unknown as File;
        
        if (imageInfo === null) return Response.json({ msgText: "File is required!" }, { status: 400 })

        const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name, folder);
        
        if (fileId) return Response.json({ success: true, data: { fileId, url }, msgText: "Uploaded!" }, { status: 201, headers: {
            'Access-Control-Allow-Origin': '*'
        } });
        return Response.json({ success: false, msgText: "Failed to upload!" }, { status: 500 });
    } catch (error) {
        console.error("FILE_UPLOAD_CONTROLLER", error)
        return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
    }
}