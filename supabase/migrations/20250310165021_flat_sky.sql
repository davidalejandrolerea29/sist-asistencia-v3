/*
  # Add attendance types and details

  1. Changes
    - Add `type` column to attendance_records
    - Add `absence_value` column to attendance_records
    - Add `details` column to attendance_records
    - Add `exit_time` column to attendance_records

  2. New Types
    - Regular attendance types
    - Physical education specific types
    - Late arrival types
    - Early exit types
    - Special activities types
*/

DO $$ BEGIN
  -- Add type column with validation
  ALTER TABLE attendance_records 
    ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'regular',
    ADD COLUMN IF NOT EXISTS absence_value numeric(3,2) NOT NULL DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS details text,
    ADD COLUMN IF NOT EXISTS exit_time text;

  -- Add constraint to validate type values
  ALTER TABLE attendance_records
    ADD CONSTRAINT valid_attendance_type 
    CHECK (type IN (
      'regular',           -- Regular attendance/absence (1 fault)
      'physical_education', -- Physical education (0.5 fault)
      'late_arrival',      -- Late arrival (0.25 fault)
      'early_exit',        -- Early exit (record exit time)
      'sports_activity',   -- Sports activities
      'academic_activity', -- Academic activities
      'medical',          -- Medical absence
      'justified',        -- Other justified absence
      'unjustified'      -- Unjustified absence
    ));

  -- Add constraint to validate absence_value
  ALTER TABLE attendance_records
    ADD CONSTRAINT valid_absence_value
    CHECK (absence_value >= 0 AND absence_value <= 1);

END $$;