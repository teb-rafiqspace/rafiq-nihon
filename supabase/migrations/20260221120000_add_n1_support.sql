-- Add JLPT N1 support to certification test questions
ALTER TABLE public.certification_test_questions DROP CONSTRAINT IF EXISTS certification_test_questions_test_type_check;
ALTER TABLE public.certification_test_questions ADD CONSTRAINT certification_test_questions_test_type_check
  CHECK (test_type IN (
    'cert_jlpt_n5', 'cert_jlpt_n4', 'cert_jlpt_n3', 'cert_jlpt_n2', 'cert_jlpt_n1', 'cert_kakunin'
  ));

-- Add JLPT N1 to test_attempts constraint
ALTER TABLE public.test_attempts DROP CONSTRAINT IF EXISTS test_attempts_test_type_check;
ALTER TABLE public.test_attempts ADD CONSTRAINT test_attempts_test_type_check
  CHECK (test_type IN (
    'kakunin', 'jlpt_n5', 'jlpt_n4', 'jlpt_n3', 'jlpt_n2', 'jlpt_n1',
    'chapter_quiz', 'ielts_mock', 'toefl_mock',
    'cert_kakunin', 'cert_jlpt_n5', 'cert_jlpt_n4', 'cert_jlpt_n3', 'cert_jlpt_n2', 'cert_jlpt_n1'
  ));
