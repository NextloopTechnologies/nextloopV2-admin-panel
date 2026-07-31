ALTER TABLE "categories" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "tags" text[];