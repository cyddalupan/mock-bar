-- Database Schema Updates for Grading Methods

-- 1. Create the 'grading_methods' table
-- This table stores different grading method templates and their names.
CREATE TABLE IF NOT EXISTS grading_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    prompt_template TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add 'grading_method_id' column to the 'quiz_new' table
-- This column will link questions to a specific grading method.
-- It is nullable to allow for existing questions without an immediate grading method,
-- or for a default fallback.
ALTER TABLE quiz_new
ADD COLUMN grading_method_id INT NULL COMMENT 'Foreign key to grading_methods table';

-- Optional: Add a foreign key constraint after adding the column.
-- This assumes that 'grading_method_id' can be NULL. If you want to enforce
-- that every question must have a grading method, remove 'ON DELETE SET NULL'
-- and ensure all existing 'quiz_new' entries have a valid 'grading_method_id'
-- before making the column NOT NULL.
ALTER TABLE quiz_new
ADD CONSTRAINT fk_grading_method
FOREIGN KEY (grading_method_id) REFERENCES grading_methods(id)
ON DELETE SET NULL;

-- 3. Insert initial grading methods (examples)
-- These are example grading methods. The actual prompts can be much longer and more detailed.
INSERT IGNORE INTO grading_methods (id, name, prompt_template) VALUES
(0, 'Default (AI General)', 'Compare the user_answer to model_answer and output only a valid JSON object with:\n- "score": integer (1-100, 100 for full match, 70-95 for close match, 0-30 for mismatch).\n- "feedback": string (Bootstrap-styled HTML table that evaluates the following criteria: Answer, Legal Basis, Application, Conclusion, and Legal Writing.\n    - Each criterion should be graded individually (5/5 if perfect).\n    - Show subtotal per criterion (max 5 points each, total 25 = 100%).\n    - Provide explanations for mistakes under each criterion.\n    - After the table, include an "Additional Insights" section in plain text containing:\n        a) The correct model_answer (either provided or AI-generated if missing).\n        b) A section titled:\n           🔎 Mistakes\n           ❌ List each mistake clearly and specifically.\n        c) Suggestions for improvement.\n        d) If the user scored perfectly, congratulate them in this section.');

INSERT IGNORE INTO grading_methods (name, prompt_template) VALUES
('ALAC', 'Evaluate the user_answer based on the ALAC (Answer, Legal Basis, Application, Conclusion) method against the model_answer. Output a JSON object with:\n- "score": integer (1-100).\n- "feedback": string (HTML table detailing ALAC criteria: Answer (correctness), Legal Basis (citations/principles), Application (to facts), Conclusion (soundness). Provide scores for each, explanations, and overall insights. Include the model_answer, specific mistakes, and improvement suggestions.');

INSERT IGNORE INTO grading_methods (name, prompt_template) VALUES
('IRAC', 'Grade the user_answer using the IRAC (Issue, Rule, Application, Conclusion) framework. Focus on identifying the legal issues, stating the relevant rules, applying rules to the facts, and drawing a conclusion. Output JSON with:\n- "score": integer (1-100).\n- "feedback": string (HTML table breaking down IRAC elements, individual scores, explanations of deficiencies, and an "Additional Insights" section with the model_answer, mistakes, and tips for improvement.');

-- Update existing questions to use the 'Default (AI General)' grading method (id 0)
-- This ensures existing questions have a linked grading method if 'grading_method_id' is NOT NULL.
-- If 'grading_method_id' is nullable, this step is optional or can be used for explicit assignment.
UPDATE quiz_new
SET grading_method_id = 0
WHERE grading_method_id IS NULL;
