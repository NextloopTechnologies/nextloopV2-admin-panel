DROP TABLE "user";--> statement-breakpoint
DROP TABLE "todos";--> statement-breakpoint
ALTER TABLE "blogs" DROP CONSTRAINT "public_blogs_author_id_fkey";
--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "location" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "applied_jobs" ADD COLUMN "job_id" bigint;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "applied_jobs" ADD CONSTRAINT "applied_jobs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "blogs" DROP COLUMN IF EXISTS "updated_ay";