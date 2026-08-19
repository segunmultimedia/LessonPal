CREATE TYPE "public"."content_source_status" AS ENUM('OFFICIAL_NACCA', 'UNVERIFIED');--> statement-breakpoint
CREATE TYPE "public"."sequence_source_status" AS ENUM('OFFICIAL_NACCA_SEQUENCE', 'LESSONPAL_GENERATED_SEQUENCE', 'UNVERIFIED');--> statement-breakpoint
CREATE TYPE "public"."support_source_status" AS ENUM('OFFICIAL_NACCA', 'LESSONPAL_GENERATED', 'TEACHER_UPLOADED', 'UNVERIFIED');--> statement-breakpoint
CREATE TABLE "curriculum_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(300) NOT NULL,
	"source_type" varchar(100),
	"url_or_reference" text,
	"version_year" varchar(50),
	"date_imported" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ALTER COLUMN "academic_term_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ALTER COLUMN "week_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD COLUMN "source_id" uuid;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD COLUMN "source_reference" text;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD COLUMN "indicator_id" uuid;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD COLUMN "content_source_status" "content_source_status" DEFAULT 'UNVERIFIED';--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD COLUMN "sequence_source_status" "sequence_source_status" DEFAULT 'UNVERIFIED';--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD COLUMN "support_source_status" "support_source_status" DEFAULT 'UNVERIFIED';--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_source_id_curriculum_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."curriculum_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE no action ON UPDATE no action;