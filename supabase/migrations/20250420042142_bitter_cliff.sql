/*
  # Document Storage and Processing Setup

  1. New Tables
    - `test_sessions`: Tracks document processing sessions
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, optional)
      - `created_at` (timestamp)
    
    - `documents`: Stores document metadata
      - `id` (uuid, primary key)
      - `session_id` (uuid, references test_sessions)
      - `name` (text)
      - `path` (text)
      - `type` (text)
      - `size` (integer)
      - `created_at` (timestamp)
    
    - `token_usage`: Tracks API token usage
      - `id` (uuid, primary key)
      - `session_id` (uuid, references test_sessions)
      - `document_id` (uuid, references documents)
      - Various token metrics and cost tracking fields
    
    - `usage_metrics`: Aggregates usage statistics
      - `id` (uuid, primary key)
      - `period_start` (timestamp)
      - `period_end` (timestamp)
      - Various aggregated metrics fields

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Set up appropriate foreign key constraints

  3. Functions
    - Add function to update usage metrics
    - Add trigger for automatic metric updates
*/

-- Test Sessions table
CREATE TABLE IF NOT EXISTS test_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES test_sessions(id),
  name text NOT NULL,
  path text NOT NULL,
  type text NOT NULL,
  size integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Token usage tracking table
CREATE TABLE IF NOT EXISTS token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES test_sessions(id),
  document_id uuid REFERENCES documents(id),
  request_type text NOT NULL,
  model text NOT NULL,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  cached_tokens integer NOT NULL DEFAULT 0,
  reasoning_tokens integer DEFAULT 0,
  cost numeric(10,4) NOT NULL DEFAULT 0,
  processing_time integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);

-- Usage metrics aggregation table
CREATE TABLE IF NOT EXISTS usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  period_type text NOT NULL, -- 'daily', 'weekly', 'monthly'
  total_requests integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  cached_tokens integer NOT NULL DEFAULT 0,
  reasoning_tokens integer NOT NULL DEFAULT 0,
  total_cost numeric(10,4) NOT NULL DEFAULT 0,
  avg_response_time integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(period_start, period_type)
);

-- Enable RLS
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read test sessions"
  ON test_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert test sessions"
  ON test_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read token usage"
  ON token_usage
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert token usage"
  ON token_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read usage metrics"
  ON usage_metrics
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update usage metrics
CREATE OR REPLACE FUNCTION update_usage_metrics()
RETURNS trigger AS $$
BEGIN
  -- Update daily metrics
  INSERT INTO usage_metrics (
    period_start,
    period_end,
    period_type,
    total_requests,
    total_tokens,
    prompt_tokens,
    completion_tokens,
    cached_tokens,
    reasoning_tokens,
    total_cost,
    avg_response_time
  )
  SELECT
    date_trunc('day', NEW.created_at),
    date_trunc('day', NEW.created_at) + interval '1 day',
    'daily',
    COUNT(*),
    SUM(total_tokens),
    SUM(prompt_tokens),
    SUM(completion_tokens),
    SUM(cached_tokens),
    SUM(reasoning_tokens),
    SUM(cost),
    AVG(processing_time)::integer
  FROM token_usage
  WHERE created_at >= date_trunc('day', NEW.created_at)
    AND created_at < date_trunc('day', NEW.created_at) + interval '1 day'
  ON CONFLICT (period_start, period_type)
  DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    total_tokens = EXCLUDED.total_tokens,
    prompt_tokens = EXCLUDED.prompt_tokens,
    completion_tokens = EXCLUDED.completion_tokens,
    cached_tokens = EXCLUDED.cached_tokens,
    reasoning_tokens = EXCLUDED.reasoning_tokens,
    total_cost = EXCLUDED.total_cost,
    avg_response_time = EXCLUDED.avg_response_time,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update metrics on new usage records
CREATE TRIGGER update_usage_metrics_trigger
  AFTER INSERT ON token_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_metrics();