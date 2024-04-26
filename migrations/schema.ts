import { pgTable, pgEnum, bigint, text, timestamp, boolean, foreignKey, varchar } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const keyStatus = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const keyType = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const aalLevel = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethod = pgEnum("code_challenge_method", ['s256', 'plain'])
export const factorStatus = pgEnum("factor_status", ['unverified', 'verified'])
export const factorType = pgEnum("factor_type", ['totp', 'webauthn'])
export const enumJobMode = pgEnum("enum_job_mode", ['Remote', 'On-site', 'Hybrid'])
export const enumJobType = pgEnum("enum_job_type", ['Full Time', 'Part Time', 'Contract'])
export const action = pgEnum("action", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])
export const equalityOp = pgEnum("equality_op", ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])


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
	image: text("image"),
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
	resume: text("resume").notNull(),
	fullname: text("fullname").notNull(),
	email: text("email").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	phone: bigint("phone", { mode: "number" }).notNull(),
	linkedinUrl: varchar("linkedin_url"),
	githubUrl: varchar("github_url"),
	coverLetter: text("cover_letter"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	jobId: bigint("job_id", { mode: "number" }).references(() => jobs.id, { onDelete: "restrict" } ),
});

export const blogs = pgTable("blogs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint("id", { mode: "number" }).primaryKey().notNull(),
	title: varchar("title"),
	image: text("image"),
	descp: text("descp"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	authorId: bigint("author_id", { mode: "number" }).references(() => author.id, { onDelete: "restrict" } ),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});