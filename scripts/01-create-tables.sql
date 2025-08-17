-- Create prospects table to store contact form submissions
CREATE TABLE IF NOT EXISTS prospects (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  product_interest VARCHAR(50) NOT NULL CHECK (product_interest IN ('vercel', 'v0', 'vercel_and_v0')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales_reps table for account executives
CREATE TABLE IF NOT EXISTS sales_reps (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meetings table to store scheduled meetings
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  sales_rep_id INTEGER NOT NULL REFERENCES sales_reps(id) ON DELETE CASCADE,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_meetings_prospect_id ON meetings(prospect_id);
CREATE INDEX IF NOT EXISTS idx_meetings_sales_rep_id ON meetings(sales_rep_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date);
