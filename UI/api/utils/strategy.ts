import { ArgumentAnalysis } from './analysis';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface DebateStrategy {
  name: string;
  description: string;
  prompt: string;
  effectiveness: number;
  appropriateFor: string[];
}

export class StrategyService {
  private strategies: Map<string, DebateStrategy>;

  constructor() {
    this.strategies = new Map();
    this.loadStrategies();
  }

  private loadStrategies() {
    const strategyTypes = [
      'socratic-questioning',
      'evidence-challenge',
      'reframe-perspective', 
      'logical-deconstruction',
      'counter-example',
      'scope-limitation',
      'practical-concerns',
      'alternative-solution'
    ];

    strategyTypes.forEach(type => {
      try {
        const prompt = readFileSync(
          join(process.cwd(), 'prompts', 'strategies', `${type}.md`),
          'utf-8'
        );
        this.strategies.set(type, {
          name: type,
          description: this.getStrategyDescription(type),
          prompt,
          effectiveness: 0,
          appropriateFor: this.getStrategyContext(type)
        });
      } catch (error) {
        console.warn(`Could not load strategy ${type}, using fallback`);
        this.strategies.set(type, this.getFallbackStrategy(type));
      }
    });
  }

  private getStrategyDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'socratic-questioning': 'Use probing questions to expose weaknesses in reasoning',
      'evidence-challenge': 'Question the quality and relevance of presented evidence',
      'reframe-perspective': 'Present the issue from a completely different angle',
      'logical-deconstruction': 'Break down the argument to find logical flaws',
      'counter-example': 'Provide specific examples that contradict the claim',
      'scope-limitation': 'Challenge the scope or applicability of the argument',
      'practical-concerns': 'Focus on real-world implementation problems',
      'alternative-solution': 'Propose a better alternative approach'
    };
    return descriptions[type] || 'Generic debate strategy';
  }

  private getStrategyContext(type: string): string[] {
    const contexts: Record<string, string[]> = {
      'socratic-questioning': ['weak-reasoning', 'opinion-based', 'assumption-heavy'],
      'evidence-challenge': ['empirical', 'research-based', 'statistical'],
      'reframe-perspective': ['narrow-view', 'single-perspective', 'oversimplified'],
      'logical-deconstruction': ['logical', 'structured', 'formal-argument'],
      'counter-example': ['generalization', 'universal-claim', 'absolute-statement'],
      'scope-limitation': ['broad-claim', 'overgeneralized', 'context-specific'],
      'practical-concerns': ['theoretical', 'idealistic', 'implementation-focused'],
      'alternative-solution': ['problem-solution', 'proposal', 'recommendation']
    };
    return contexts[type] || ['general'];
  }

  private getFallbackStrategy(type: string): DebateStrategy {
    return {
      name: type,
      description: this.getStrategyDescription(type),
      prompt: `You are engaging in a debate using the ${type} strategy. 
               Respond thoughtfully and strategically to counter the user's argument.
               Be respectful but firm in your disagreement.`,
      effectiveness: 5,
      appropriateFor: this.getStrategyContext(type)
    };
  }

  async selectStrategy(
    analysis: ArgumentAnalysis,
    roomType: string,
    conversationHistory: Array<{ text: string; sender: 'user' | 'ai' }>
  ): Promise<DebateStrategy> {
    // Calculate effectiveness scores for each strategy
    const strategyScores = new Map<string, number>();

    for (const [name, strategy] of this.strategies) {
      let score = 5; // baseline

      // Adjust based on argument analysis
      score += this.scoreBasedOnArgumentType(analysis.type, strategy);
      score += this.scoreBasedOnWeaknesses(analysis.weaknesses, strategy);
      score += this.scoreBasedOnFallacies(analysis.fallacies, strategy);
      score += this.scoreBasedOnStrength(analysis.strength, strategy);
      score += this.scoreBasedOnRoomType(roomType, strategy);
      score += this.scoreBasedOnHistory(conversationHistory, strategy);

      strategyScores.set(name, score);
    }

    // Select the highest scoring strategy
    let bestStrategy = 'logical-deconstruction';
    let bestScore = 0;

    for (const [name, score] of strategyScores) {
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = name;
      }
    }

    const selectedStrategy = this.strategies.get(bestStrategy)!;
    selectedStrategy.effectiveness = bestScore;

    return selectedStrategy;
  }

  private scoreBasedOnArgumentType(type: string, strategy: DebateStrategy): number {
    const typeStrategies: Record<string, string[]> = {
      'empirical': ['evidence-challenge', 'scope-limitation'],
      'ethical': ['reframe-perspective', 'counter-example'],
      'opinion-based': ['socratic-questioning', 'logical-deconstruction'],
      'logical': ['logical-deconstruction', 'counter-example']
    };

    return typeStrategies[type]?.includes(strategy.name) ? 2 : 0;
  }

  private scoreBasedOnWeaknesses(weaknesses: string[], strategy: DebateStrategy): number {
    let score = 0;
    
    weaknesses.forEach(weakness => {
      if (weakness.includes('opinion') && strategy.name === 'socratic-questioning') score += 1;
      if (weakness.includes('assumption') && strategy.name === 'evidence-challenge') score += 1;
      if (weakness.includes('generalization') && strategy.name === 'counter-example') score += 1;
    });

    return score;
  }

  private scoreBasedOnFallacies(fallacies: string[], strategy: DebateStrategy): number {
    let score = 0;
    
    fallacies.forEach(fallacy => {
      if (fallacy.includes('bandwagon') && strategy.name === 'logical-deconstruction') score += 2;
      if (fallacy.includes('slippery slope') && strategy.name === 'scope-limitation') score += 2;
      if (fallacy.includes('straw man') && strategy.name === 'reframe-perspective') score += 2;
    });

    return score;
  }

  private scoreBasedOnStrength(strength: number, strategy: DebateStrategy): number {
    // For stronger arguments, use more sophisticated strategies
    if (strength >= 8) {
      return ['evidence-challenge', 'scope-limitation'].includes(strategy.name) ? 2 : 0;
    }
    // For weaker arguments, use direct approaches
    if (strength <= 4) {
      return ['socratic-questioning', 'logical-deconstruction'].includes(strategy.name) ? 2 : 0;
    }
    return 0;
  }

  private scoreBasedOnRoomType(roomType: string, strategy: DebateStrategy): number {
    const roomStrategies: Record<string, string[]> = {
      'Law': ['evidence-challenge', 'logical-deconstruction'],
      'Politics': ['reframe-perspective', 'practical-concerns'],
      'Ethics': ['socratic-questioning', 'counter-example'],
      'Cultural': ['reframe-perspective', 'alternative-solution'],
      'Technology': ['practical-concerns', 'scope-limitation']
    };

    return roomStrategies[roomType]?.includes(strategy.name) ? 1 : 0;
  }

  private scoreBasedOnHistory(
    history: Array<{ text: string; sender: 'user' | 'ai' }>,
    strategy: DebateStrategy
  ): number {
    // Avoid repeating the same strategy too often
    const recentAiResponses = history.slice(-4).filter(h => h.sender === 'ai');
    const strategyUsed = recentAiResponses.some(response => 
      response.text.toLowerCase().includes(strategy.name.replace('-', ' '))
    );

    return strategyUsed ? -1 : 0;
  }
}