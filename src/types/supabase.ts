export interface Database {
  public: {
    Tables: {
      test_sessions: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          path: string;
          type: string;
          size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          path: string;
          type: string;
          size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          path?: string;
          type?: string;
          size?: number;
          created_at?: string;
        };
      };
      extraction_results: {
        Row: {
          id: string;
          session_id: string;
          document_id: string;
          raw_content: string;
          prompt_used: string;
          extracted_data: any;
          metrics: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          document_id: string;
          raw_content: string;
          prompt_used: string;
          extracted_data: any;
          metrics: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          document_id?: string;
          raw_content?: string;
          prompt_used?: string;
          extracted_data?: any;
          metrics?: any;
          created_at?: string;
        };
      };
      prompt_versions: {
        Row: {
          id: string;
          name: string;
          content: string;
          version: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          content: string;
          version: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          content?: string;
          version?: number;
          created_at?: string;
        };
      };
      token_usage: {
        Row: {
          id: string;
          session_id: string;
          document_id: string;
          request_type: string;
          model: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cached_tokens: number;
          reasoning_tokens: number;
          cost: number;
          processing_time: number;
          created_at: string;
          metadata: any;
        };
        Insert: {
          id?: string;
          session_id?: string;
          document_id?: string;
          request_type: string;
          model: string;
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
          cached_tokens: number;
          reasoning_tokens?: number;
          cost: number;
          processing_time: number;
          created_at?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          session_id?: string;
          document_id?: string;
          request_type?: string;
          model?: string;
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          cached_tokens?: number;
          reasoning_tokens?: number;
          cost?: number;
          processing_time?: number;
          created_at?: string;
          metadata?: any;
        };
      };
      usage_metrics: {
        Row: {
          id: string;
          period_start: string;
          period_end: string;
          period_type: string;
          total_requests: number;
          total_tokens: number;
          prompt_tokens: number;
          completion_tokens: number;
          cached_tokens: number;
          reasoning_tokens: number;
          total_cost: number;
          avg_response_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          period_start: string;
          period_end: string;
          period_type: string;
          total_requests?: number;
          total_tokens?: number;
          prompt_tokens?: number;
          completion_tokens?: number;
          cached_tokens?: number;
          reasoning_tokens?: number;
          total_cost?: number;
          avg_response_time?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          period_start?: string;
          period_end?: string;
          period_type?: string;
          total_requests?: number;
          total_tokens?: number;
          prompt_tokens?: number;
          completion_tokens?: number;
          cached_tokens?: number;
          reasoning_tokens?: number;
          total_cost?: number;
          avg_response_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    StorageBuckets: {
      'syllabus-documents': {
        Policies: {
          publicRead: {
            PolicyName: 'Public Read';
            Definition: '';
          };
        };
      };
    };
  };
}

export interface TokenUsage {
  id: string;
  session_id?: string;
  document_id?: string;
  request_type: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens: number;
  reasoning_tokens?: number;
  cost: number;
  processing_time: number;
  created_at: string;
  metadata?: any;
}

export interface UsageMetrics {
  id: string;
  period_start: string;
  period_end: string;
  period_type: string;
  total_requests: number;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  cached_tokens: number;
  reasoning_tokens: number;
  total_cost: number;
  avg_response_time: number;
  created_at: string;
  updated_at: string;
}