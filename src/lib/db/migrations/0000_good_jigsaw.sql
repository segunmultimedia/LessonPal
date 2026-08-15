CREATE TYPE "public"."user_role" AS ENUM('teacher', 'supervisor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."carry_over_resolution" AS ENUM('pending', 'carried_forward', 'rescheduled', 'merged', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."lesson_source" AS ENUM('upload', 'manual');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('upcoming', 'today', 'in_progress', 'completed', 'partially_completed', 'not_taught', 'carried_forward', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."upload_status" AS ENUM('pending', 'processing', 'extracted', 'review', 'approved', 'failed');--> statement-breakpoint
CREATE TABLE "academic_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"term_number" integer NOT NULL,
	"total_weeks" integer NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_level_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_level_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	CONSTRAINT "class_level_subjects_class_level_id_subject_id_unique" UNIQUE("class_level_id","subject_id")
);
--> statement-breakpoint
CREATE TABLE "class_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_level_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"short_name" varchar(20),
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_standards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_strand_id" uuid NOT NULL,
	"description" text NOT NULL,
	"code" varchar(50),
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(3) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "curricula" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"version" varchar(50),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_standard_id" uuid NOT NULL,
	"description" text NOT NULL,
	"code" varchar(50),
	"academic_term_id" uuid,
	"week_number" integer,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "strands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"class_level_id" uuid NOT NULL,
	"name" varchar(300) NOT NULL,
	"code" varchar(50),
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sub_strands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strand_id" uuid NOT NULL,
	"name" varchar(300) NOT NULL,
	"code" varchar(50),
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(20),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(300) NOT NULL,
	"location" varchar(300),
	"district" varchar(200),
	"region" varchar(200),
	"country_id" uuid,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teacher_class_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_profile_id" uuid NOT NULL,
	"class_level_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"academic_term_id" uuid,
	"academic_year" varchar(9),
	"current_week" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "teacher_class_subjects_teacher_profile_id_class_level_id_subject_id_academic_term_id_unique" UNIQUE("teacher_profile_id","class_level_id","subject_id","academic_term_id")
);
--> statement-breakpoint
CREATE TABLE "teacher_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"school_id" uuid,
	"staff_id" varchar(50),
	"phone" varchar(20),
	"onboarding_completed" boolean DEFAULT false,
	"curriculum_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "teacher_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now(),
	"granted_by" uuid,
	CONSTRAINT "user_roles_user_id_role_unique" UNIQUE("user_id","role")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"full_name" varchar(200) NOT NULL,
	"avatar_url" text,
	"email_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "carry_overs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_lesson_id" uuid NOT NULL,
	"resolution" "carry_over_resolution" DEFAULT 'pending',
	"target_lesson_id" uuid,
	"target_date" date,
	"reason" text,
	"skip_reason" text,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_profile_id" uuid NOT NULL,
	"original_filename" varchar(500) NOT NULL,
	"storage_path" text NOT NULL,
	"file_type" varchar(10) NOT NULL,
	"file_size_bytes" integer,
	"status" "upload_status" DEFAULT 'pending',
	"page_count" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "extraction_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_upload_id" uuid NOT NULL,
	"extracted_class" varchar(100),
	"extracted_subject" varchar(100),
	"extracted_term" varchar(50),
	"extracted_week" integer,
	"extracted_date" date,
	"extracted_day" varchar(20),
	"extracted_strand" text,
	"extracted_sub_strand" text,
	"extracted_topic" text,
	"extracted_content_standard" text,
	"extracted_indicator" text,
	"extracted_learning_objectives" text,
	"extracted_teaching_activities" text,
	"extracted_learner_activities" text,
	"extracted_assessment" text,
	"extracted_resources" text,
	"extracted_duration" varchar(50),
	"confidence_score" numeric(3, 2),
	"raw_ai_response" jsonb,
	"teacher_corrections" jsonb,
	"is_teacher_approved" boolean DEFAULT false,
	"approved_at" timestamp with time zone,
	"resolved_class_level_id" uuid,
	"resolved_subject_id" uuid,
	"resolved_indicator_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scheduled_lesson_id" uuid NOT NULL,
	"status" "lesson_status" NOT NULL,
	"actual_date" date NOT NULL,
	"actual_start_time" time,
	"actual_end_time" time,
	"stopped_at_description" text,
	"stopped_at_section" varchar(200),
	"remaining_content" text,
	"estimated_remaining_minutes" integer,
	"teacher_notes" text,
	"skip_reason" text,
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_class_subject_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"strand" text,
	"sub_strand" text,
	"content_standard" text,
	"learning_objectives" text,
	"teaching_activities" text,
	"learner_activities" text,
	"assessment" text,
	"resources" text,
	"indicator_id" uuid,
	"scheduled_date" date NOT NULL,
	"scheduled_time" time,
	"duration_minutes" integer,
	"week_number" integer,
	"source" "lesson_source" DEFAULT 'manual',
	"extraction_result_id" uuid,
	"status" "lesson_status" DEFAULT 'upcoming',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"original_lesson_id" uuid,
	"is_carry_over" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teaching_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_class_subject_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" varchar(50) NOT NULL,
	"previous_values" jsonb,
	"new_values" jsonb,
	"performed_by" uuid NOT NULL,
	"performed_at" timestamp with time zone DEFAULT now(),
	"ip_address" varchar(45),
	"user_agent" text
);
--> statement-breakpoint
ALTER TABLE "academic_levels" ADD CONSTRAINT "academic_levels_curriculum_id_curricula_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curricula"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_curriculum_id_curricula_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curricula"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_level_subjects" ADD CONSTRAINT "class_level_subjects_class_level_id_class_levels_id_fk" FOREIGN KEY ("class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_level_subjects" ADD CONSTRAINT "class_level_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_levels" ADD CONSTRAINT "class_levels_academic_level_id_academic_levels_id_fk" FOREIGN KEY ("academic_level_id") REFERENCES "public"."academic_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_standards" ADD CONSTRAINT "content_standards_sub_strand_id_sub_strands_id_fk" FOREIGN KEY ("sub_strand_id") REFERENCES "public"."sub_strands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_content_standard_id_content_standards_id_fk" FOREIGN KEY ("content_standard_id") REFERENCES "public"."content_standards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_academic_term_id_academic_terms_id_fk" FOREIGN KEY ("academic_term_id") REFERENCES "public"."academic_terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strands" ADD CONSTRAINT "strands_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strands" ADD CONSTRAINT "strands_class_level_id_class_levels_id_fk" FOREIGN KEY ("class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_strands" ADD CONSTRAINT "sub_strands_strand_id_strands_id_fk" FOREIGN KEY ("strand_id") REFERENCES "public"."strands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_curriculum_id_curricula_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curricula"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_class_subjects" ADD CONSTRAINT "teacher_class_subjects_teacher_profile_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_profile_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_class_subjects" ADD CONSTRAINT "teacher_class_subjects_class_level_id_class_levels_id_fk" FOREIGN KEY ("class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_class_subjects" ADD CONSTRAINT "teacher_class_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_class_subjects" ADD CONSTRAINT "teacher_class_subjects_academic_term_id_academic_terms_id_fk" FOREIGN KEY ("academic_term_id") REFERENCES "public"."academic_terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_profiles" ADD CONSTRAINT "teacher_profiles_curriculum_id_curricula_id_fk" FOREIGN KEY ("curriculum_id") REFERENCES "public"."curricula"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carry_overs" ADD CONSTRAINT "carry_overs_source_lesson_id_scheduled_lessons_id_fk" FOREIGN KEY ("source_lesson_id") REFERENCES "public"."scheduled_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carry_overs" ADD CONSTRAINT "carry_overs_target_lesson_id_scheduled_lessons_id_fk" FOREIGN KEY ("target_lesson_id") REFERENCES "public"."scheduled_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carry_overs" ADD CONSTRAINT "carry_overs_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_teacher_profile_id_teacher_profiles_id_fk" FOREIGN KEY ("teacher_profile_id") REFERENCES "public"."teacher_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_results" ADD CONSTRAINT "extraction_results_document_upload_id_document_uploads_id_fk" FOREIGN KEY ("document_upload_id") REFERENCES "public"."document_uploads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_results" ADD CONSTRAINT "extraction_results_resolved_class_level_id_class_levels_id_fk" FOREIGN KEY ("resolved_class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_results" ADD CONSTRAINT "extraction_results_resolved_subject_id_subjects_id_fk" FOREIGN KEY ("resolved_subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "extraction_results" ADD CONSTRAINT "extraction_results_resolved_indicator_id_indicators_id_fk" FOREIGN KEY ("resolved_indicator_id") REFERENCES "public"."indicators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_scheduled_lesson_id_scheduled_lessons_id_fk" FOREIGN KEY ("scheduled_lesson_id") REFERENCES "public"."scheduled_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_lessons" ADD CONSTRAINT "scheduled_lessons_teacher_class_subject_id_teacher_class_subjects_id_fk" FOREIGN KEY ("teacher_class_subject_id") REFERENCES "public"."teacher_class_subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_lessons" ADD CONSTRAINT "scheduled_lessons_indicator_id_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."indicators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_lessons" ADD CONSTRAINT "scheduled_lessons_extraction_result_id_extraction_results_id_fk" FOREIGN KEY ("extraction_result_id") REFERENCES "public"."extraction_results"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_lessons" ADD CONSTRAINT "scheduled_lessons_original_lesson_id_scheduled_lessons_id_fk" FOREIGN KEY ("original_lesson_id") REFERENCES "public"."scheduled_lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teaching_periods" ADD CONSTRAINT "teaching_periods_teacher_class_subject_id_teacher_class_subjects_id_fk" FOREIGN KEY ("teacher_class_subject_id") REFERENCES "public"."teacher_class_subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "academic_levels_curriculum_id_idx" ON "academic_levels" USING btree ("curriculum_id");--> statement-breakpoint
CREATE INDEX "academic_terms_curriculum_id_idx" ON "academic_terms" USING btree ("curriculum_id");--> statement-breakpoint
CREATE INDEX "class_level_subjects_class_level_id_idx" ON "class_level_subjects" USING btree ("class_level_id");--> statement-breakpoint
CREATE INDEX "class_level_subjects_subject_id_idx" ON "class_level_subjects" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "class_levels_academic_level_id_idx" ON "class_levels" USING btree ("academic_level_id");--> statement-breakpoint
CREATE INDEX "content_standards_sub_strand_id_idx" ON "content_standards" USING btree ("sub_strand_id");--> statement-breakpoint
CREATE INDEX "curricula_country_id_idx" ON "curricula" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "indicators_content_standard_id_idx" ON "indicators" USING btree ("content_standard_id");--> statement-breakpoint
CREATE INDEX "indicators_academic_term_id_idx" ON "indicators" USING btree ("academic_term_id");--> statement-breakpoint
CREATE INDEX "strands_subject_id_idx" ON "strands" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "strands_class_level_id_idx" ON "strands" USING btree ("class_level_id");--> statement-breakpoint
CREATE INDEX "sub_strands_strand_id_idx" ON "sub_strands" USING btree ("strand_id");--> statement-breakpoint
CREATE INDEX "subjects_curriculum_id_idx" ON "subjects" USING btree ("curriculum_id");--> statement-breakpoint
CREATE INDEX "schools_country_id_idx" ON "schools" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "teacher_class_subjects_teacher_profile_id_idx" ON "teacher_class_subjects" USING btree ("teacher_profile_id");--> statement-breakpoint
CREATE INDEX "teacher_class_subjects_class_level_id_idx" ON "teacher_class_subjects" USING btree ("class_level_id");--> statement-breakpoint
CREATE INDEX "teacher_class_subjects_subject_id_idx" ON "teacher_class_subjects" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "teacher_class_subjects_academic_term_id_idx" ON "teacher_class_subjects" USING btree ("academic_term_id");--> statement-breakpoint
CREATE INDEX "teacher_profiles_school_id_idx" ON "teacher_profiles" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "teacher_profiles_curriculum_id_idx" ON "teacher_profiles" USING btree ("curriculum_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "carry_overs_source_lesson_id_idx" ON "carry_overs" USING btree ("source_lesson_id");--> statement-breakpoint
CREATE INDEX "carry_overs_target_lesson_id_idx" ON "carry_overs" USING btree ("target_lesson_id");--> statement-breakpoint
CREATE INDEX "carry_overs_resolution_idx" ON "carry_overs" USING btree ("resolution");--> statement-breakpoint
CREATE INDEX "document_uploads_teacher_profile_id_idx" ON "document_uploads" USING btree ("teacher_profile_id");--> statement-breakpoint
CREATE INDEX "document_uploads_status_idx" ON "document_uploads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "extraction_results_document_upload_id_idx" ON "extraction_results" USING btree ("document_upload_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_scheduled_lesson_id_idx" ON "lesson_progress" USING btree ("scheduled_lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_progress_status_idx" ON "lesson_progress" USING btree ("status");--> statement-breakpoint
CREATE INDEX "scheduled_lessons_teacher_class_subject_id_idx" ON "scheduled_lessons" USING btree ("teacher_class_subject_id");--> statement-breakpoint
CREATE INDEX "scheduled_lessons_scheduled_date_idx" ON "scheduled_lessons" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "scheduled_lessons_teacher_class_subject_date_idx" ON "scheduled_lessons" USING btree ("teacher_class_subject_id","scheduled_date");--> statement-breakpoint
CREATE INDEX "scheduled_lessons_status_idx" ON "scheduled_lessons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "teaching_periods_teacher_class_subject_id_idx" ON "teaching_periods" USING btree ("teacher_class_subject_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_performed_by_idx" ON "audit_log" USING btree ("performed_by");