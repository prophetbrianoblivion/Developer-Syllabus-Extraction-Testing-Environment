import { supabase } from './supabaseClient';
import type { TokenUsage } from '../types/supabase';

interface TokenUsageData {
  sessionId?: string;
  documentId?: string;
  requestType: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  reasoningTokens?: number;
  processingTime: number;
  metadata?: any;
}

const calculateCost = (
  model: string,
  promptTokens: number,
  completionTokens: number,
  cachedTokens: number,
  reasoningTokens: number = 0
): number => {
  // DeepSeek pricing per million tokens
  const prices = {
    'deepseek-chat': {
      inputCached: 0.07,
      inputNew: 0.27,
      output: 1.10
    },
    'deepseek-reasoner': {
      inputCached: 0.14,
      inputNew: 0.55,
      output: 2.19
    }
  };

  const modelPrices = prices[model as keyof typeof prices] || prices['deepseek-chat'];
  
  // Convert to per-token prices
  const inputCachedPrice = modelPrices.inputCached / 1_000_000;
  const inputNewPrice = modelPrices.inputNew / 1_000_000;
  const outputPrice = modelPrices.output / 1_000_000;
  
  const cost = 
    (cachedTokens * inputCachedPrice) +
    ((promptTokens - cachedTokens) * inputNewPrice) +
    (completionTokens * outputPrice) +
    (reasoningTokens * outputPrice);
  
  return Number(cost.toFixed(4));
};

export const trackTokenUsage = async (data: TokenUsageData): Promise<void> => {
  const {
    sessionId,
    documentId,
    requestType,
    model,
    promptTokens,
    completionTokens,
    cachedTokens,
    reasoningTokens = 0,
    processingTime,
    metadata
  } = data;

  const totalTokens = promptTokens + completionTokens + reasoningTokens;
  const cost = calculateCost(model, promptTokens, completionTokens, cachedTokens, reasoningTokens);

  const usageData: TokenUsage['Insert'] = {
    session_id: sessionId,
    document_id: documentId,
    request_type: requestType,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    cached_tokens: cachedTokens,
    reasoning_tokens: reasoningTokens,
    cost,
    processing_time: processingTime,
    metadata
  };

  const { error } = await supabase
    .from('token_usage')
    .insert([usageData]);

  if (error) {
    console.error('Error tracking token usage:', error);
    throw error;
  }
};

export const getUsageMetrics = async (
  periodType: 'daily' | 'weekly' | 'monthly' = 'daily',
  startDate?: string,
  endDate?: string
) => {
  let query = supabase
    .from('usage_metrics')
    .select('*')
    .eq('period_type', periodType)
    .order('period_start', { ascending: false });

  if (startDate) {
    query = query.gte('period_start', startDate);
  }
  if (endDate) {
    query = query.lte('period_end', endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching usage metrics:', error);
    throw error;
  }

  return data;
};

export const getSessionUsage = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('token_usage')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching session usage:', error);
    throw error;
  }

  return data;
};

export const getDocumentUsage = async (documentId: string) => {
  const { data, error } = await supabase
    .from('token_usage')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching document usage:', error);
    throw error;
  }

  return data;
};