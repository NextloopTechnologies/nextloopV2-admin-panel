import { enumJobMode, enumJobType } from "@/migrations/schema";
import { bigint, boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const ideas = pgTable("ideas", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	mail: text("mail").notNull(),
	ideaDescp: text("idea_descp").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const author = pgTable("author", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	profile: text("profile"),
	name: text("name"),
	designation: text("designation"),
});

export const jobs = pgTable("jobs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	title: text("title"),
	descp: text("descp"),
	responsibilities: text("responsibilities").array(),
	qualifications: text("qualifications").array(),
	skills: text("skills").array(),
	location: text("location"),
	jobMode: enumJobMode("job_mode"),
	package: text("package"),
	jobType: enumJobType("job_type"),
});

export const portfolio = pgTable("portfolio", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	image: text("image").array(),
	title: text("title"),
	descp: text("descp"),
	active: boolean("active").default(true).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const testimonials = pgTable("testimonials", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	feedbackBy: text("feedback_by"),
	feedbackDescp: text("feedback_descp"),
	compAndDesig: text("comp_and_desig"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const appliedJobs = pgTable("applied_jobs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	jobId: bigint("job_id", { mode: "number" }).references(() => jobs.id, { onDelete: 'restrict' }),
	resume: text("resume").notNull(),
	fullname: text("fullname").notNull(),
	email: text("email").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	phone: bigint("phone", { mode: "number" }).notNull(),
	linkedinUrl: varchar("linkedin_url"),
	githubUrl: varchar("github_url"),
	coverLetter: text("cover_letter"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const blogs = pgTable("blogs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	title: varchar("title"),
	image: text("image"),
	descp: text("descp"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	authorId: bigint("author_id", { mode: "number" }).references(() => author.id, { onDelete: "restrict" }),
});
