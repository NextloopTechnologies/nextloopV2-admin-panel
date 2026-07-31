import { IAuthor } from "@/types/supabase";
import { AuthorService } from "../..";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const pageNo = Number(req.nextUrl.searchParams.get('page')) 
    const pageSize = Number(req.nextUrl.searchParams.get('row')) 
    const { status, ...data }  = await AuthorService.list(pageNo, pageSize);
    if(status!==200) return Response.json({ data }, { status })
    return Response.json({ data }, { status })  
  } catch (error) {
    console.error("AUTHOR_LIST_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const payload: IAuthor = {
      name: formData.get('name') as string,
      designation: formData.get('designation') as string,
      profile: (formData.get('profile') as string) || null,
      description: (formData.get('description') as string) || null,
    }

    const { status, ...data} = await AuthorService.create(payload);
    if(status!==201) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("AUTHOR_CREATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

export async function PUT(req: Request) {
  try {    
    const formData = await req.formData();
    const id = Number(formData.get("id"));
    const payload: IAuthor = {
      name: formData.get('name') as string,
      designation: formData.get('designation') as string,
      profile: (formData.get('profile') as string) || null,
      description: (formData.get('description') as string) || null,
    }
    
    const { status, ...data} = await AuthorService.update(payload, id);
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("AUTHOR_UPDATE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }  
}

export async function DELETE(req: Request) {
  try {
    const deleteIds =  await req.json()
    const { status, ...data } = await AuthorService.remove(deleteIds)
    if(status!==200) return Response.json({ data }, { status });
    return Response.json({ data }, { status });
  } catch (error) {
    console.error("AUTHOR_DELETE_CONTROLLER", error)
    return Response.json({ msgText: "Something went wrong!" }, { status: 500 })
  }
}

