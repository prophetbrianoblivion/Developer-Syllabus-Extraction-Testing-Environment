export interface ExtractionMetrics {
  tokensUsed: number;
  processingTime: number;
  cost: number;
  accuracy?: number;
  expected?: {
    itemCount: number;
    eventCount: number;
    dateCount: number;
  };
  actual?: {
    itemCount: number;
    eventCount: number;
    dateCount: number;
  };
  promptTokens: number;
  completionTokens: number;
}

export const calculateAccuracy = (
  expected: { itemCount: number; eventCount: number; dateCount: number },
  actual: { itemCount: number; eventCount: number; dateCount: number }
): number => {
  if (expected.itemCount === 0 && expected.eventCount === 0 && expected.dateCount === 0) {
    return 0;
  }

  const itemAccuracy = expected.itemCount > 0 
    ? Math.min(actual.itemCount / expected.itemCount, 1) 
    : 1;
  
  const eventAccuracy = expected.eventCount > 0 
    ? Math.min(actual.eventCount / expected.eventCount, 1) 
    : 1;
  
  const dateAccuracy = expected.dateCount > 0 
    ? Math.min(actual.dateCount / expected.dateCount, 1) 
    : 1;

  // Weighted average (can adjust weights based on importance)
  return (itemAccuracy * 0.3 + eventAccuracy * 0.4 + dateAccuracy * 0.3) * 100;
};

export const countExtractedItems = (extractedData: any): { 
  itemCount: number; 
  eventCount: number; 
  dateCount: number; 
} => {
  if (!extractedData || typeof extractedData !== 'object') {
    return { itemCount: 0, eventCount: 0, dateCount: 0 };
  }

  // This is a simplistic implementation
  // In a real application, this would be more sophisticated and tailored to the expected schema
  let eventCount = 0;
  let dateCount = 0;
  
  // Count events (assuming they're in an array called 'events' or 'items')
  if (Array.isArray(extractedData.events)) {
    eventCount = extractedData.events.length;
  } else if (Array.isArray(extractedData.items)) {
    eventCount = extractedData.items.length;
  }
  
  // Count dates by searching for date-like properties
  const countDatesInObject = (obj: any): number => {
    if (!obj || typeof obj !== 'object') return 0;
    
    let count = 0;
    for (const key in obj) {
      const value = obj[key];
      
      // Check if property is likely a date
      if (typeof key === 'string' && 
         (key.toLowerCase().includes('date') || 
          key.toLowerCase().includes('deadline') || 
          key.toLowerCase().includes('due'))) {
        if (value && (typeof value === 'string' || value instanceof Date)) {
          count++;
        }
      }
      
      // Recursively check nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        count += countDatesInObject(value);
      }
      
      // Check arrays
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') {
            count += countDatesInObject(item);
          }
        }
      }
    }
    
    return count;
  };
  
  dateCount = countDatesInObject(extractedData);
  
  // Total item count (total number of key-value pairs)
  const countItems = (obj: any): number => {
    if (!obj || typeof obj !== 'object') return 0;
    
    let count = Object.keys(obj).length;
    
    for (const key in obj) {
      const value = obj[key];
      
      // Recursively count items in nested objects
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        count += countItems(value);
      }
      
      // Count items in arrays
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') {
            count += countItems(item);
          } else {
            count++; // Count primitive values in arrays
          }
        }
      }
    }
    
    return count;
  };
  
  const itemCount = countItems(extractedData);
  
  return { itemCount, eventCount, dateCount };
};