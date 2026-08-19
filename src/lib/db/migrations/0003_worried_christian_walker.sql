ALTER TABLE "academic_levels" ADD CONSTRAINT "academic_levels_identity_unq" UNIQUE("curriculum_id","name");--> statement-breakpoint
ALTER TABLE "academic_terms" ADD CONSTRAINT "academic_terms_identity_unq" UNIQUE("curriculum_id","term_number");--> statement-breakpoint
ALTER TABLE "class_levels" ADD CONSTRAINT "class_levels_identity_unq" UNIQUE("academic_level_id","name");--> statement-breakpoint
ALTER TABLE "content_standards" ADD CONSTRAINT "content_standards_identity_unq" UNIQUE("sub_strand_id","code");--> statement-breakpoint
ALTER TABLE "curricula" ADD CONSTRAINT "curricula_identity_unq" UNIQUE("country_id","name","version");--> statement-breakpoint
ALTER TABLE "curriculum_sources" ADD CONSTRAINT "curriculum_sources_identity_unq" UNIQUE("title","version_year");--> statement-breakpoint
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_identity_unq" UNIQUE("content_standard_id","code");--> statement-breakpoint
ALTER TABLE "strands" ADD CONSTRAINT "strands_identity_unq" UNIQUE("subject_id","class_level_id","sort_order");--> statement-breakpoint
ALTER TABLE "sub_strands" ADD CONSTRAINT "sub_strands_identity_unq" UNIQUE("strand_id","sort_order");--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_identity_unq" UNIQUE("curriculum_id","name");--> statement-breakpoint
ALTER TABLE "curriculum_lessons" ADD CONSTRAINT "curriculum_lessons_identity_unq" UNIQUE("class_level_id","subject_id","academic_term_id","week_number","lesson_number","indicator_id");--> statement-breakpoint
ALTER TABLE "exercise_questions" ADD CONSTRAINT "exercise_questions_identity_unq" UNIQUE("exercise_id","sort_order");--> statement-breakpoint
ALTER TABLE "lesson_exercises" ADD CONSTRAINT "lesson_exercises_identity_unq" UNIQUE("curriculum_lesson_id","title");