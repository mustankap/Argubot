import { DebateAPI, DebateRequest, DebateResponse } from '../debate';

// This would be an Express.js route or similar in a full backend
// For now, we'll export a function that can be called from the frontend

const debateAPI = new DebateAPI();

export async function handleDebateRequest(request: DebateRequest): Promise<DebateResponse> {
  try {
    console.log('Processing debate request:', {
      topic: request.topic,
      userArgument: request.userArgument.substring(0, 100) + '...',
      historyLength: request.conversationHistory.length
    });

    const response = await debateAPI.generateResponse(request);
    
    console.log('Generated response:', {
      strategy: response.strategy,
      confidence: response.confidence,
      responseLength: response.response.length
    });

    return response;
  } catch (error) {
    console.error('Error in debate request:', error);
    
    // Fallback response
    return {
      response: "I'm having trouble processing your argument right now. Let me think about this differently... I still disagree with your position, but I need a moment to formulate a proper counterargument. Care to elaborate on your reasoning while I gather my thoughts?",
      strategy: 'fallback',
      confidence: 0.3,
      sources: [],
      analysis: {
        argumentType: 'unknown',
        strength: 5,
        weaknesses: ['Unable to analyze'],
        logicalFallacies: []
      }
    };
  }
}

// Export types for frontend use
export type { DebateRequest, DebateResponse };