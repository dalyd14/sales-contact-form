-- Insert sample sales reps
INSERT INTO sales_reps (name, email) VALUES 
  ('Sarah Johnson', 'sarah.johnson@vercel.com'),
  ('Mike Chen', 'mike.chen@vercel.com'),
  ('Emily Rodriguez', 'emily.rodriguez@vercel.com')
ON CONFLICT (email) DO NOTHING;
