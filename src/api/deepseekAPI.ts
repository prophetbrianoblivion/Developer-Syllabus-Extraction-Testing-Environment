// Deepseek API client for syllabus extraction

interface DeepseekConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
}

interface ExtractionRequest {
  documentContent: string;
  prompt: string;
}

interface ExtractionResponse {
  extractedData: any;
  rawResponse: any;
  metrics: {
    tokensUsed: number;
    processingTime: number;
    cost: number;
    promptTokens: number;
    completionTokens: number;
  };
}

let config: DeepseekConfig = {
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
  model: 'deepseek-coder',
  baseUrl: 'https://api.deepseek.com/v1',
  maxTokens: 2048
};

export const initializeDeepseekAPI = (newConfig: Partial<DeepseekConfig>) => {
  config = { ...config, ...newConfig };
  return config;
};

export const extractDataFromSyllabus = async (
  request: ExtractionRequest
): Promise<ExtractionResponse> => {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts structured data from syllabus documents.'
          },
          {
            role: 'user',
            content: `${request.prompt}\n\nDocument content:\n${request.documentContent}`
          }
        ],
        max_tokens: config.maxTokens,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    const data = await response.json();
    
    // Calculate tokens (actual implementation would get this from the API response)
    const promptTokens = Math.ceil(request.prompt.length / 4) + Math.ceil(request.documentContent.length / 4);
    const completionTokens = data.choices?.[0]?.message?.content.length / 4 || 0;
    const totalTokens = promptTokens + completionTokens;
    
    // Calculate estimated cost (placeholder)
    const costPerToken = 0.00002; // Example rate
    const estimatedCost = totalTokens * costPerToken;
    
    const processingTime = Date.now() - startTime;

    // Parse the JSON response from the LLM
    let extractedData;
    try {
      const content = data.choices?.[0]?.message?.content || '';
      // Extract JSON from content (assuming it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       [null, content];
      
      extractedData = JSON.parse(jsonMatch[1]);
    } catch (parseError) {
      console.error('Failed to parse JSON from LLM response:', parseError);
      extractedData = { error: 'Failed to parse extraction result' };
    }

    return {
      extractedData,
      rawResponse: data,
      metrics: {
        tokensUsed: totalTokens,
        processingTime,
        cost: estimatedCost,
        promptTokens,
        completionTokens
      }
    };
  } catch (error) {
    console.error('Deepseek API error:', error);
    throw new Error(`Deepseek API error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API connection test failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};
