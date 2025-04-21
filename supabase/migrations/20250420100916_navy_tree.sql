-- Drop the existing function and trigger
DROP TRIGGER IF EXISTS update_usage_metrics_trigger ON public.token_usage;
DROP FUNCTION IF EXISTS public.update_usage_metrics();

-- Recreate the function with explicit schema references and security context
CREATE OR REPLACE FUNCTION public.update_usage_metrics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _period_start timestamptz;
  _period_end timestamptz;
BEGIN
  -- Calculate period boundaries
  _period_start := date_trunc('day', NEW.created_at);
  _period_end := _period_start + interval '1 day';

  -- Update daily metrics with explicit schema references
  INSERT INTO public.usage_metrics (
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
    _period_start,
    _period_end,
    'daily',
    COUNT(*),
    SUM(total_tokens),
    SUM(prompt_tokens),
    SUM(completion_tokens),
    SUM(cached_tokens),
    SUM(reasoning_tokens),
    SUM(cost),
    AVG(processing_time)::integer
  FROM public.token_usage
  WHERE created_at >= _period_start
    AND created_at < _period_end
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
$$;

-- Recreate the trigger
CREATE TRIGGER update_usage_metrics_trigger
  AFTER INSERT ON public.token_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_usage_metrics();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_usage_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_usage_metrics() TO service_role;