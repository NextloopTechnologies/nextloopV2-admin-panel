import { UploadFileService } from "../..";
import { apiResponse, errorResponse } from "@/app/api/utils/response";

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
        
        if (imageInfo === null) return apiResponse({ msgText: "File is required!" }, { status: 400 })

        const { fileId, url } = await UploadFileService.uploadImage(imageInfo, imageInfo.name, folder);
        
        if (fileId) return apiResponse({ success: true, data: { fileId, url }, msgText: "Uploaded!" }, { status: 201, headers: {
            'Access-Control-Allow-Origin': '*'
        } });
        return apiResponse({ success: false, msgText: "Failed to upload!" }, { status: 500 });
    } catch (error) {
        console.error("FILE_UPLOAD_CONTROLLER", error)
        return apiResponse({ msgText: "Something went wrong!" }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const files = await req.json();
        if (!Array.isArray(files) || files.length === 0 || files.some(file => typeof file !== "string" || !file.trim())) {
            return apiResponse({ success: false, msgText: "At least one valid file id is required." }, { status: 400 });
        }

        await UploadFileService.deleteFiles(files);
        return apiResponse({ success: true, msgText: "Files deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error("FILE_DELETE_CONTROLLER", error);
        return errorResponse(error);
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url).searchParams.get("url");
        if (!url?.trim()) return apiResponse({ success: false, msgText: "A file URL is required." }, { status: 400 });
        const transformedUrl = await UploadFileService.getTransformedUrl(url);
        return apiResponse({ success: true, data: { url: transformedUrl }, msgText: "URL transformed successfully." });
    } catch (error) {
        console.error("FILE_TRANSFORM_CONTROLLER", error);
        return errorResponse(error);
    }
}