-- Create save_states table for storing EmulatorJS save states
CREATE TABLE IF NOT EXISTS save_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  console_type TEXT NOT NULL,
  slot_number INTEGER NOT NULL,
  save_data TEXT NOT NULL, -- Base64 encoded save data
  screenshot TEXT, -- Optional base64 encoded screenshot
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one save per user/game/console/slot combination
  UNIQUE(user_id, game_name, console_type, slot_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_save_states_user_game 
ON save_states(user_id, game_name, console_type);

-- Enable Row Level Security (RLS)
ALTER TABLE save_states ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own save states
CREATE POLICY "Users can view own save states" ON save_states
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own save states" ON save_states
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own save states" ON save_states
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own save states" ON save_states
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_save_states_updated_at 
  BEFORE UPDATE ON save_states 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Update save_states table to use Supabase Storage instead of storing data directly
ALTER TABLE save_states DROP COLUMN IF EXISTS save_data;
ALTER TABLE save_states ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE save_states ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Create Supabase Storage bucket for save state files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('save-states', 'save-states', false)
ON CONFLICT (id) DO NOTHING;

-- Create Storage RLS policies
-- Users can only access their own save state files
CREATE POLICY "Users can view own save files" ON storage.objects
  FOR SELECT USING (bucket_id = 'save-states' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own save files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'save-states' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own save files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'save-states' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own save files" ON storage.objects
  FOR DELETE USING (bucket_id = 'save-states' AND auth.uid()::text = (storage.foldername(name))[1]);