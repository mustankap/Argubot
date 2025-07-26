import { AnalysisService } from './utils/analysis';
import { StrategyService } from './utils/strategy';
import { ResponseGeneratorService } from './utils/responseGenerator';

export interface DebateRequest {
  userArgument: string;
  topic: string;
  conversationHistory: Array<{
    text: string;
    sender: 'user' | 'ai';
  }>;
  roomType: string;
}

export interface DebateResponse {
  response: string;
  strategy: string;
  confidence: number;
  sources?: string[];
  analysis: {
    argumentType: string;
    strength: number;
    weaknesses: string[];
    logicalFallacies: string[];
  };
}

export class DebateAPI {
  private analysisService: AnalysisService;
  private strategyService: StrategyService;
  private responseGenerator: ResponseGeneratorService;

  constructor() {
    this.analysisService = new AnalysisService();
    this.strategyService = new StrategyService();
    this.responseGenerator = new ResponseGeneratorService();
  }

  async generateResponse(request: DebateRequest): Promise<DebateResponse> {
    try {
      // Step 1: Analyze the user's argument
      const analysis = await this.analysisService.analyzeArgument(
        request.userArgument,
        request.topic,
        request.conversationHistory
      );

      // Step 2: Select the best response strategy
      const strategy = await this.strategyService.selectStrategy(
        analysis,
        request.roomType,
        request.conversationHistory
      );

      // Step 3: Generate the response using the selected strategy
      const response = await this.responseGenerator.generateResponse(
        request.userArgument,
        analysis,
        strategy,
        request.topic,
        request.conversationHistory
      );

      return {
        response: response.text,
        strategy: strategy.name,
        confidence: response.confidence,
        sources: response.sources,
        analysis: {
          argumentType: analysis.type,
          strength: analysis.strength,
          weaknesses: analysis.weaknesses,
          logicalFallacies: analysis.fallacies
        }
      };
    } catch (error) {
      console.error('Error generating debate response:', error);
      throw new Error('Failed to generate debate response');
    }
  }
}