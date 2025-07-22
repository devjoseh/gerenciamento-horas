-- Complete database setup for Time Tracker application
-- This script creates all necessary tables, indexes, triggers, and policies

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS overtime_summary CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

-- Create areas table to organize tasks by company/area
CREATE TABLE areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#4472C4', -- Hex color for visual identification
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table with area relationship
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  time_limit TIME, -- Format: "HH:MM:SS" for overtime calculation
  area_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_tasks_area_id 
    FOREIGN KEY (area_id) 
    REFERENCES areas(id) 
    ON DELETE SET NULL
);

-- Create time_entries table with overtime tracking
CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  regular_seconds INTEGER DEFAULT 0,
  overtime_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_time_entries_task_id 
    FOREIGN KEY (task_id) 
    REFERENCES tasks(id) 
    ON DELETE CASCADE
);

-- Create overtime_summary table to track daily overtime
CREATE TABLE overtime_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_overtime_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX idx_areas_name ON areas(name);
CREATE INDEX idx_areas_is_default ON areas(is_default);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_area_id ON tasks(area_id);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX idx_time_entries_end_time ON time_entries(end_time);
CREATE INDEX idx_time_entries_overtime ON time_entries(overtime_seconds);

CREATE INDEX idx_overtime_summary_date ON overtime_summary(date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_areas_updated_at 
  BEFORE UPDATE ON areas
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update overtime summary
CREATE OR REPLACE FUNCTION update_overtime_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if overtime_seconds changed
  IF (TG_OP = 'INSERT' AND NEW.overtime_seconds > 0) OR 
     (TG_OP = 'UPDATE' AND OLD.overtime_seconds != NEW.overtime_seconds) THEN
    
    INSERT INTO overtime_summary (date, total_overtime_seconds)
    VALUES (DATE(NEW.start_time), NEW.overtime_seconds)
    ON CONFLICT (date) 
    DO UPDATE SET 
      total_overtime_seconds = overtime_summary.total_overtime_seconds + NEW.overtime_seconds - COALESCE(OLD.overtime_seconds, 0),
      updated_at = NOW();
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for overtime summary updates
CREATE TRIGGER update_overtime_summary_trigger
  AFTER INSERT OR UPDATE ON time_entries
  FOR EACH ROW 
  EXECUTE FUNCTION update_overtime_summary();

-- Enable Row Level Security
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users only
-- Areas table policies
CREATE POLICY "Authenticated users can view areas" ON areas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert areas" ON areas
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update areas" ON areas
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete areas" ON areas
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Tasks table policies
CREATE POLICY "Authenticated users can view tasks" ON tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tasks" ON tasks
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tasks" ON tasks
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Time entries table policies
CREATE POLICY "Authenticated users can view time_entries" ON time_entries
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert time_entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update time_entries" ON time_entries
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete time_entries" ON time_entries
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Overtime summary table policies
CREATE POLICY "Authenticated users can view overtime_summary" ON overtime_summary
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert overtime_summary" ON overtime_summary
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update overtime_summary" ON overtime_summary
  FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete overtime_summary" ON overtime_summary
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Insert default areas
INSERT INTO areas (name, description, color, is_default) VALUES 
  ('Projetos Pessoais', 'Projetos e tarefas pessoais', '#70AD47', true),
  ('Empresa Principal', 'Projetos da empresa onde trabalho', '#4472C4', false),
  ('Freelances', 'Projetos freelance e consultoria', '#FF9900', false);

-- Insert sample tasks for testing
INSERT INTO tasks (name, description, status, area_id) VALUES 
  ('Configurar Sistema', 'Configuração inicial do sistema de controle de tempo', 'pending', 
   (SELECT id FROM areas WHERE is_default = true LIMIT 1)),
  ('Primeira Tarefa', 'Exemplo de tarefa para testar o sistema', 'in_progress', 
   (SELECT id FROM areas WHERE name = 'Empresa Principal' LIMIT 1)),
  ('Tarefa Concluída', 'Exemplo de tarefa finalizada', 'completed', 
   (SELECT id FROM areas WHERE name = 'Freelances' LIMIT 1));