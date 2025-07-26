import { readFileSync } from 'fs';
import { join } from 'path';

export interface ArgumentAnalysis {
  type: string;
  strength: number;
  weaknesses: string[];
  fallacies: string[];
  emotionalAppeals: string[];
  evidenceQuality: number;
  logicalStructure: number;
  counterargumentPotential: string[];
}

export class AnalysisService {
  private analysisPrompt: string;

  constructor() {
    this.analysisPrompt = this.loadPrompt('analysis/argument-analysis.md');
  }

  private loadPrompt(filename: string): string {
    try {
      const promptPath = join(process.cwd(), 'prompts', filename);
      return readFileSync(promptPath, 'utf-8');
    } catch (error) {
      console.warn(`Could not load prompt ${filename}, using fallback`);
      return this.getFallbackAnalysisPrompt();
    }
  }

  private getFallbackAnalysisPrompt(): string {
    return `
You are an expert argument analyst. Analyze the following argument and provide a detailed breakdown.

Consider:
1. Argument type (logical, emotional, ethical, etc.)
2. Strength (1-10 scale)
3. Logical fallacies present
4. Weaknesses and vulnerabilities
5. Evidence quality
6. Emotional appeals used
7. Potential counterarguments

Respond in JSON format with the analysis.
    `;
  }

  async analyzeArgument(
    argument: string,
    topic: string,
    conversationHistory: Array<{ text: string; sender: 'user' | 'ai' }>
  ): Promise<ArgumentAnalysis> {
    const prompt = this.buildAnalysisPrompt(argument, topic, conversationHistory);
    
    // This would typically call an LLM API
    // For now, we'll return a mock analysis
    return this.performAnalysis(argument, topic);
  }

  private buildAnalysisPrompt(
    argument: string,
    topic: string,
    history: Array<{ text: string; sender: 'user' | 'ai' }>
  ): string {
    const contextHistory = history.slice(-3).map(h => 
      `${h.sender}: ${h.text}`
    ).join('\n');

    return `${this.analysisPrompt}

DEBATE TOPIC: ${topic}

CONVERSATION CONTEXT:
${contextHistory}

CURRENT ARGUMENT TO ANALYZE: ${argument}

Please provide a comprehensive analysis in JSON format.`;
  }

  private async performAnalysis(argument: string, topic: string): Promise<ArgumentAnalysis> {
    // Mock analysis - in production this would call an LLM
    const words = argument.toLowerCase();
    
    return {
      type: this.detectArgumentType(words),
      strength: this.calculateStrength(argument),
      weaknesses: this.identifyWeaknesses(words),
      fallacies: this.detectFallacies(words),
      emotionalAppeals: this.detectEmotionalAppeals(words),
      evidenceQuality: this.assessEvidenceQuality(words),
      logicalStructure: this.assessLogicalStructure(argument),
      counterargumentPotential: this.identifyCounterarguments(words, topic)
    };
  }

  private detectArgumentType(words: string): string {
    if (words.includes('study') || words.includes('research') || words.includes('data')) {
      return 'empirical';
    }
    if (words.includes('should') || words.includes('ought') || words.includes('moral')) {
      return 'ethical';
    }
    if (words.includes('feel') || words.includes('believe') || words.includes('think')) {
      return 'opinion-based';
    }
    return 'logical';
  }

  private calculateStrength(argument: string): number {
    let strength = 5; // baseline
    
    // Evidence indicators
    if (argument.includes('study') || argument.includes('research')) strength += 1;
    if (argument.includes('expert') || argument.includes('professor')) strength += 1;
    if (argument.includes('data') || argument.includes('statistics')) strength += 1;
    
    // Structure indicators
    if (argument.includes('because') || argument.includes('therefore')) strength += 1;
    if (argument.includes('however') || argument.includes('although')) strength += 1;
    
    // Weakness indicators
    if (argument.includes('I think') || argument.includes('I feel')) strength -= 1;
    if (argument.includes('obviously') || argument.includes('clearly')) strength -= 1;
    
    return Math.max(1, Math.min(10, strength));
  }

  private identifyWeaknesses(words: string): string[] {
    const weaknesses: string[] = [];
    
    if (words.includes('i think') || words.includes('i believe')) {
      weaknesses.push('Over-reliance on personal opinion');
    }
    if (words.includes('everyone knows') || words.includes('obviously')) {
      weaknesses.push('Unsupported assumptions');
    }
    if (words.includes('always') || words.includes('never')) {
      weaknesses.push('Overgeneralization');
    }
    
    return weaknesses;
  }

  private detectFallacies(words: string): string[] {
    const fallacies: string[] = [];
    
    if (words.includes('everyone') && words.includes('thinks')) {
      fallacies.push('Bandwagon fallacy');
    }
    if (words.includes('slippery slope') || (words.includes('if') && words.includes('then'))) {
      fallacies.push('Slippery slope');
    }
    if (words.includes('strawman') || words.includes('you said')) {
      fallacies.push('Straw man');
    }
    
    return fallacies;
  }

  private detectEmotionalAppeals(words: string): string[] {
    const appeals: string[] = [];
    
    if (words.includes('fear') || words.includes('danger') || words.includes('threat')) {
      appeals.push('Appeal to fear');
    }
    if (words.includes('tradition') || words.includes('always done')) {
      appeals.push('Appeal to tradition');
    }
    if (words.includes('expert') || words.includes('authority')) {
      appeals.push('Appeal to authority');
    }
    
    return appeals;
  }

  private assessEvidenceQuality(words: string): number {
    let quality = 3; // baseline out of 10
    
    if (words.includes('study') || words.includes('research')) quality += 3;
    if (words.includes('peer-reviewed') || words.includes('published')) quality += 2;
    if (words.includes('data') || words.includes('statistics')) quality += 2;
    if (words.includes('source') || words.includes('citation')) quality += 1;
    
    return Math.min(10, quality);
  }

  private assessLogicalStructure(argument: string): number {
    let structure = 5; // baseline
    
    // Good structure indicators
    if (argument.includes('because') || argument.includes('since')) structure += 1;
    if (argument.includes('therefore') || argument.includes('thus')) structure += 1;
    if (argument.includes('however') || argument.includes('although')) structure += 1;
    if (argument.includes('first') || argument.includes('second')) structure += 1;
    
    // Poor structure indicators
    if (argument.split('.').length < 2) structure -= 1; // Very short
    if (!argument.includes('because') && !argument.includes('since')) structure -= 1; // No reasoning
    
    return Math.max(1, Math.min(10, structure));
  }

  private identifyCounterarguments(words: string, topic: string): string[] {
    // This would be more sophisticated in production
    return [
      'Alternative perspective consideration',
      'Evidence quality challenge',
      'Scope limitation argument',
      'Practical implementation concerns'
    ];
  }
}