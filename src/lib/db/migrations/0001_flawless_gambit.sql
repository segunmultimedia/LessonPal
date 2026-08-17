CREATE TABLE "curriculum_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_level_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"academic_term_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"lesson_number" integer NOT NULL,
	"topic" text NOT NULL,
	"learning_objective" text,
	"what_to_teach" text,
	"how_to_teach" text,
	"activities" text,
	"resources" text,
	"duration_minutes" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exercise_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curriculum_lesson_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "scheduled_lessons" ADD COLUMN "curriculum_lesson_id" uuid;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_class_level_id_class_levels_id_fk" FOREIGN KEY ("class_level_id") REFERENCES "public"."class_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_academic_term_id_academic_terms_id_fk" FOREIGN KEY ("academic_term_id") REFERENCES "public"."academic_terms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_questions" ADD CONSTRAINT "exercise_questions_exercise_id_lesson_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."lesson_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_exercises" ADD CONSTRAINT "lesson_exercises_curriculum_lesson_id_curriculum_lessons_id_fk" FOREIGN KEY ("curriculum_lesson_id") REFERENCES "public"."curriculum_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "curriculum_lessons_class_subject_term_idx" ON "curriculum_lessons" USING btree ("class_level_id","subject_id","academic_term_id");--> statement-breakpoint
CREATE INDEX "curriculum_lessons_week_lesson_idx" ON "curriculum_lessons" USING btree ("week_number","lesson_number");--> statement-breakpoint
CREATE INDEX "exercise_questions_exercise_id_idx" ON "exercise_questions" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "lesson_exercises_curriculum_lesson_id_idx" ON "lesson_exercises" USING btree ("curriculum_lesson_id");--> statement-breakpoint
ALTER TABLE "scheduled_lessons" ADD CONSTRAINT "scheduled_lessons_curriculum_lesson_id_curriculum_lessons_id_fk" FOREIGN KEY ("curriculum_lesson_id") REFERENCES "public"."curriculum_lessons"("id") ON DELETE no action ON UPDATE no action;