import { z } from "zod";


export const AppliedJobSchema = z.object({
    job_id: z.number({ required_error: " job_id is required" }),
    fullname: z.string({ required_error: "fulllname is required" }).min(3, "atleast 3 chars").max(20, "max 20 chars"),
    email: z.string({ required_error: "email is required" }).email("Invalid email"),
    phone: z.string({ required_error: "phone is required" }).regex(/^[0-9]{10}$/, "must be 10 digits"),
    resume_url: z.string({ required_error: "resume url is required" }).url("must be a valid url"),
    resume_id: z.string({ required_error: "resume id  is required" }),
    cover_letter: z.string().min(3, "alteaslt 3 chars").optional(),
    linkedin_url: z.string().url("must be a valid url").optional(),
    github_url: z.string().url("must be a valid url").optional(),
})

const PartialAppliedJobSchema = AppliedJobSchema.partial()

export type CreateAppliedJobDto = z.infer<typeof AppliedJobSchema>;
export type UpdateAppliedJobDto = z.infer<typeof PartialAppliedJobSchema>
export type SchemaErrorResponse = Record<string, unknown>;