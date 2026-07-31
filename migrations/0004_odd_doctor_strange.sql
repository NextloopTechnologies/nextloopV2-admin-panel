DO $$ BEGIN
 CREATE TYPE "enum_blog_status" AS ENUM('draft', 'published');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "status" "enum_blog_status" DEFAULT 'draft' NOT NULL;