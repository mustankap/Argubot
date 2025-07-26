import { ArgumentAnalysis } from './analysis';
import { DebateStrategy } from './strategy';

export interface GeneratedResponse {
  text: string;
  confidence: number;
  sources: string[];
  reasoning: string;
}

export class ResponseGeneratorService {
  
  async generateResponse(
    userArgument: string,
    analysis: ArgumentAnalysis,
    strategy: DebateStrategy,
    topic: string,
    conversationHistory: Array<{ text: string; sender: 'user' | 'ai' }>
  ): Promise<GeneratedResponse> {
    
    const prompt = this.buildPrompt(userArgument, analysis, strategy, topic, conversationHistory);
    
    // In production, this would call an LLM API (OpenAI, Anthropic, etc.)
    // For now, we'll generate a structured response based on the strategy
    const response = await this.generateStrategyResponse(userArgument, analysis, strategy, topic);
    
    return response;
  }

  private buildPrompt(
    userArgument: string,
    analysis: ArgumentAnalysis,
    strategy: DebateStrategy,
    topic: string,
    history: Array<{ text: string; sender: 'user' | 'ai' }>
  ): string {
    const contextHistory = history.slice(-3).map(h => 
      `${h.sender}: ${h.text}`
    ).join('\n');

    return `${strategy.prompt}

DEBATE CONTEXT:
Topic: ${topic}
Strategy: ${strategy.name}
Strategy Description: ${strategy.description}

ARGUMENT ANALYSIS:
- Type: ${analysis.type}
- Strength: ${analysis.strength}/10
- Weaknesses: ${analysis.weaknesses.join(', ')}
- Fallacies: ${analysis.fallacies.join(', ')}
- Evidence Quality: ${analysis.evidenceQuality}/10

CONVERSATION HISTORY:
${contextHistory}

USER'S ARGUMENT: ${userArgument}

Generate a compelling counterargument using the ${strategy.name} strategy. Be respectful but firm in your disagreement. Keep the response engaging and conversational while maintaining intellectual rigor.`;
  }

  private async generateStrategyResponse(
    userArgument: string,
    analysis: ArgumentAnalysis,
    strategy: DebateStrategy,
    topic: string
  ): Promise<GeneratedResponse> {
    
    // Generate response based on strategy type
    switch (strategy.name) {
      case 'socratic-questioning':
        return this.generateSocraticResponse(userArgument, analysis, topic);
      
      case 'evidence-challenge':
        return this.generateEvidenceChallengeResponse(userArgument, analysis, topic);
      
      case 'logical-deconstruction':
        return this.generateLogicalDeconstructionResponse(userArgument, analysis, topic);
      
      case 'reframe-perspective':
        return this.generateReframeResponse(userArgument, analysis, topic);
      
      case 'counter-example':
        return this.generateCounterExampleResponse(userArgument, analysis, topic);
      
      default:
        return this.generateGenericResponse(userArgument, analysis, topic);
    }
  }

  private generateSocraticResponse(argument: string, analysis: ArgumentAnalysis, topic: string): GeneratedResponse {
    const questions = [
      `I'm curious about your reasoning here. When you say "${this.extractKeyPhrase(argument)}", what exactly do you mean by that?`,
      `That's an interesting perspective. What evidence led you to be so confident in this conclusion?`,
      `Help me understand - what assumptions are you making about ${topic} that might influence this view?`,
      `I wonder, how would you respond to someone who might argue the opposite? What would you say to them?`
    ];

    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    return {
      text: `${selectedQuestion} I ask because there seem to be some aspects of this argument that deserve deeper examination. ${this.generateWeaknessChallenge(analysis.weaknesses)}`,
      confidence: 0.8,
      sources: [],
      reasoning: 'Using Socratic questioning to expose assumptions and reasoning gaps'
    };
  }

  private generateEvidenceChallengeResponse(argument: string, analysis: ArgumentAnalysis, topic: string): GeneratedResponse {
    const challenges = [
      "I'd like to examine the evidence you're citing more closely.",
      "While you've presented some data, I have concerns about its interpretation.",
      "The research you're referencing may not support your conclusion as strongly as you think."
    ];

    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    return {
      text: `${challenge} ${this.generateEvidenceSpecificChallenge(argument, analysis)} This matters because evidence quality is crucial when discussing ${topic}. Have you considered alternative interpretations of this data?`,
      confidence: 0.85,
      sources: this.generateMockSources(topic),
      reasoning: 'Challenging evidence quality and interpretation'
    };
  }

  private generateLogicalDeconstructionResponse(argument: string, analysis: ArgumentAnalysis, topic: string): GeneratedResponse {
    return {
      text: `Let me examine the logical structure of your argument. You seem to be arguing that ${this.extractKeyPhrase(argument)}, but there's a gap in the reasoning here. ${this.generateLogicalFlaw(analysis.fallacies)} If we follow this logic consistently, we'd also have to accept some problematic conclusions about ${topic}. The argument breaks down at this logical connection.`,
      confidence: 0.9,
      sources: [],
      reasoning: 'Systematic deconstruction of logical structure'
    };
  }

  private generateReframeResponse(argument: string, analysis: ArgumentAnalysis, topic: string): GeneratedResponse {
    return {
      text: `I see this differently. While you're focusing on ${this.extractKeyPhrase(argument)}, consider this alternative perspective: ${this.generateAlternativeFrame(topic)}. This reframing reveals some assumptions in your argument that might not hold up under scrutiny. When we look at ${topic} through this lens, your conclusion becomes much less certain.`,
      confidence: 0.75,
      sources: [],
      reasoning: 'Reframing the issue from a different perspective'
    };
  }

  private generateCounterExampleResponse(argument: string, analysis: ArgumentAnalysis, topic: string): GeneratedResponse {
    return {
      text: `Your argument relies on a generalization that doesn't hold up to scrutiny. Consider this counterexample: ${this.generateCounterExample(topic)}. This case directly contradicts your claim that ${this.extractKeyPhrase(argument)}. If your reasoning were sound, how would you account for this exception? The existence of such counterexamples suggests your argument is overgeneralized.`,
      confidence: 0.8,
      sources: [],
      reasoning: 'Providing specific counterexamples to challenge generalizations'
    };
  }

  private generateGenericResponse(argument: string, analysis: ArgumentAnalysis, topic: string): GeneratedResponse {
    return {
      text: `I disagree with your position on ${topic}. While you argue that ${this.extractKeyPhrase(argument)}, this perspective overlooks several important considerations. ${this.generateWeaknessChallenge(analysis.weaknesses)} A more nuanced view would recognize the complexity of this issue and avoid such definitive conclusions.`,
      confidence: 0.7,
      sources: [],
      reasoning: 'Generic counterargument approach'
    };
  }

  private extractKeyPhrase(argument: string): string {
    // Extract a key phrase from the argument
    const sentences = argument.split('.').filter(s => s.trim().length > 0);
    return sentences[0]?.trim() || argument.substring(0, 100) + '...';
  }

  private generateWeaknessChallenge(weaknesses: string[]): string {
    if (weaknesses.length === 0) return '';
    
    const challenges = {
      'Over-reliance on personal opinion': 'Personal opinions, while valid, don\'t constitute evidence for broader claims.',
      'Unsupported assumptions': 'You\'re making several assumptions here that aren\'t necessarily true.',
      'Overgeneralization': 'This generalization ignores important exceptions and nuances.'
    };

    const weakness = weaknesses[0];
    return challenges[weakness as keyof typeof challenges] || 'There are some logical issues with this reasoning.';
  }

  private generateEvidenceSpecificChallenge(argument: string, analysis: ArgumentAnalysis): string {
    if (analysis.evidenceQuality < 5) {
      return 'The evidence quality here is questionable - we need more rigorous sources.';
    }
    if (argument.toLowerCase().includes('study')) {
      return 'What was the methodology of this study? Sample size matters, and so does peer review.';
    }
    return 'The interpretation of this evidence seems selective and potentially misleading.';
  }

  private generateLogicalFlaw(fallacies: string[]): string {
    if (fallacies.length === 0) return 'The logical connection between your premises and conclusion is weak.';
    
    const fallacyExplanations = {
      'Bandwagon fallacy': 'Just because many people believe something doesn\'t make it true.',
      'Slippery slope': 'You\'re assuming a chain reaction that isn\'t necessarily inevitable.',
      'Straw man': 'You\'re misrepresenting the opposing position to make it easier to attack.'
    };

    const fallacy = fallacies[0];
    return fallacyExplanations[fallacy as keyof typeof fallacyExplanations] || 'There\'s a logical fallacy in your reasoning.';
  }

  private generateAlternativeFrame(topic: string): string {
    const frames = {
      'Law': 'instead of focusing on legal precedent, consider the underlying principles of justice',
      'Politics': 'rather than partisan positions, think about what actually serves citizens best',
      'Ethics': 'beyond individual rights, consider collective responsibility and harm',
      'Cultural': 'instead of traditional practices, focus on evolving social needs',
      'Technology': 'rather than technical possibilities, consider human and societal implications'
    };

    return frames[topic as keyof typeof frames] || 'there\'s a completely different way to approach this issue';
  }

  private generateCounterExample(topic: string): string {
    const examples = {
      'Law': 'the landmark case that established an exception to this legal principle',
      'Politics': 'the policy that succeeded despite conventional wisdom suggesting it would fail',
      'Ethics': 'the situation where this moral principle leads to clearly unethical outcomes',
      'Cultural': 'the culture that thrives despite rejecting this supposedly universal norm',
      'Technology': 'the technology that was adopted successfully despite violating this assumption'
    };

    return examples[topic as keyof typeof examples] || 'a clear example that contradicts your general claim';
  }

  private generateMockSources(topic: string): string[] {
    const baseSources = [
      'Journal of Advanced Research',
      'International Review of Studies',
      'Proceedings of the Academic Conference',
      'Peer-Reviewed Analysis Report'
    ];

    return baseSources.map(source => `${source} on ${topic} (2024)`).slice(0, 2);
  }
}