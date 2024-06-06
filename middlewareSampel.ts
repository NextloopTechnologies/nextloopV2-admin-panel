// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import multer, { MulterError } from 'multer';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { RequestHandler } from 'express';


// type NextApiRequestWithFormData = NextApiRequest &
//   Request & {
//     files: any[];
//   };

// type NextApiResponseCustom = NextApiResponse & Response;

// export default function initMiddleware(middleware: RequestHandler) {
//   return (
//     req: NextApiRequestWithFormData,
//     res: NextApiResponseCustom
//   ): Promise<any> =>
//     new Promise((resolve, reject) => {
//       middleware(req, res, (result: any) => {
//         if (result instanceof Error) {
//           return reject(result);
//         }
//         return resolve(result);
//       });
//     });
// }
// const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } }).single('image');

 
// This function can be marked `async` if using `await` inside
// export async function middleware(request: Request) {
 
//   // File data
//   const formData = await request.formData();
//   const base64Img = formData.get('image');
//   const imageName = formData.get('imageName'); 

//   console.log("form data", formData);
// }

// const fileUploads = (filename,filelimit=5) => {
//   console.log("From middleware file ",filename, filelimit);
//   if(filelimit === 1) {
//       var upload = multer({
//           limits: { fileSize: 2 * 1024 * 1024 }
//       }).single(filename);
//   } else {
//       upload = multer({
//           limits: { fileSize: 2000000 }
//       }).array(filename, filelimit);
//   }
//   return (req, res, next) => {
//       upload(req, res,(err) => {
//           if(err instanceof MulterError) {
//               if(err.message == 'File too large') {
//                   console.log(`Multer: ${err}`);
//                   return res.status(401).send({msgText: "File too Large" ,success: false })
//               } else if(err.message == 'Unexpected field' && filelimit === 1) {
//                   console.log(`Multer: ${err.message}`);
//                   return res.status(401).send({msgText: "Max one allowed" ,success: false })
//               } 
//           } else if (err) {
//               console.log(`U.E: ${err.message}`);
//               return res.status(401).send({error: `U.E: ${err.message}` ,success: false }) // Unknown  error while uploading
//           }
//           next();
//       });
//   }  
// };

// export default fileUploads; 
 
// See "Matching Paths" below to learn more
// export const config = {
//   matcher: '/api/upload',
// }