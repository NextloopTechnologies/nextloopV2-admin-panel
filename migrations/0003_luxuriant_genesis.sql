ALTER TABLE "blogs" ADD COLUMN "slug" varchar;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_title" varchar(60);--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "meta_description" varchar(160);--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_slug_unique" UNIQUE("slug");