import React, { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ArrowLeft, Clock, Send, Trophy, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { Judge } from "./Judge";

interface ArenaProps {
  roomName: string;
  onBack: () => void;
}

// Funny/sarcastic AI thinking status messages
const thinkingStatuses = [
  "researching how many green bubblers are single",
  "studying android user poverty levels",
  "calculating the economic impact of having an opinion",
  "consulting the ancient scrolls of Wikipedia",
  "asking my mom for advice",
  "generating statistics that sound believable",
  "cross-referencing with my gut feeling",
  "polling my imaginary focus group",
  "checking if this violates any terms of service",
  "wondering why humans argue about everything",
  "contemplating the meaning of being right on the internet",
  "analyzing the philosophical implications of your stance"
];

// Mock research sources
const mockSources = [
  { title: "Android Usage Statistics 2025", url: "https://www.demandsage.com/android-statistics/" },
  { title: "Global Bubble Preferences Study", url: "https://www.bubbleresearch.org/studies/2024" },
  { title: "Economic Impact of Mobile Platforms", url: "https://www.techeconomics.com/mobile-impact" },
  { title: "Consumer Behavior Analysis Report", url: "https://www.marketinsights.com/consumer-behavior" },
  { title: "Digital Lifestyle Demographics", url: "https://www.digitaldemographics.net/lifestyle-study" }
];

export function Arena({ roomName, onBack }: ArenaProps) {
  const [argument, setArgument] = useState("");
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300); // 5 minute session timer
  const [promptTimeLeft, setPromptTimeLeft] = useState(60); // 1 minute prompt timer
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPromptActive, setIsPromptActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(true); // Track whose turn it is
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai'}>>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isJudgeEvaluating, setIsJudgeEvaluating] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [lastAiMessage, setLastAiMessage] = useState("");
  const [debatePhase, setDebatePhase] = useState<'initial' | 'debate'>('initial');
  const [debateTopic, setDebateTopic] = useState<string>("");
  const [roundNumber, setRoundNumber] = useState(0);
  const [isRoundJudged, setIsRoundJudged] = useState(false);
  
  // Ref for messages container to enable auto-scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Session timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isSessionActive && sessionTimeLeft > 0) {
      interval = setInterval(() => {
        setSessionTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (sessionTimeLeft === 0) {
      setIsSessionActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, sessionTimeLeft]);

  // Prompt timer effect - auto-submits when time runs out
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPromptActive && promptTimeLeft > 0) {
      interval = setInterval(() => {
        setPromptTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (promptTimeLeft === 0 && isPromptActive) {
      // Auto-submit whatever is in the input field
      handleSubmitArgument(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPromptActive, promptTimeLeft]);

  // Cycling status messages effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isAiThinking) {
      interval = setInterval(() => {
        setCurrentStatusIndex(prev => (prev + 1) % thinkingStatuses.length);
      }, 2000); // Change status every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAiThinking, thinkingStatuses.length]);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Trigger auto-scroll when messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll when AI starts thinking (to show the thinking indicator)
  useEffect(() => {
    if (isAiThinking) {
      // Small delay to ensure the thinking indicator is rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [isAiThinking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitArgument = (autoSubmit = false) => {
    // Allow submission even with empty text when auto-submitting
    if (argument.trim() || autoSubmit) {
      const messageText = argument.trim() || "(no response)";
      
      // Add user message to conversation
      setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
      
      if (!gameStarted) {
        setGameStarted(true);
        setIsSessionActive(true);
      }
      
      // Stop prompt timer and switch to AI turn
      setIsPromptActive(false);
      setIsUserTurn(false);
      setArgument("");
      setIsAiThinking(true);
      setCurrentStatusIndex(0);
      
      // Handle different phases
      if (debatePhase === 'initial') {
        // First submission - AI returns single debate topic from "API"
        setTimeout(() => {
          // Simulate API response with a single debate topic
          const apiTopic = `Why ${messageText.toLowerCase()} is actually harmful to society`;
          
          setIsAiThinking(false);
          setMessages(prev => [...prev, { 
            text: `Perfect! I've found the ideal debate topic: "${apiTopic}". Let's begin - I'll argue against your position!`, 
            sender: 'ai' 
          }]);
          
          setDebateTopic(apiTopic);
          setDebatePhase('debate');
          setIsUserTurn(true);
          setPromptTimeLeft(60);
        }, 8000);
      } else if (debatePhase === 'debate') {
        // Ongoing debate - normal flow with judge evaluation
        const currentRound = roundNumber + 1;
        setRoundNumber(currentRound);
        setIsRoundJudged(false);
        setIsJudgeEvaluating(false); // Explicitly reset judge state at start of round
        setLastUserMessage(messageText);
        
        console.log(`Starting round ${currentRound}, isRoundJudged reset to false`);
        
        setTimeout(() => {
          const aiResponse = `I strongly disagree with your stance on "${debateTopic}". Here's my counterargument based on extensive research...`;
          setIsAiThinking(false);
          setMessages(prev => [...prev, { 
            text: aiResponse, 
            sender: 'ai' 
          }]);
          
          setLastAiMessage(aiResponse);
          
          // Always start judging for debate rounds - the isRoundJudged check should be fresh
          console.log(`AI response complete for round ${currentRound}, starting judge...`);
          // Small delay to ensure messages are rendered before starting judge animation
          setTimeout(() => {
            setIsJudgeEvaluating(true);
          }, 200);
          
          setTimeout(() => {
            setIsUserTurn(true);
            setPromptTimeLeft(60);
          }, 1000);
        }, 8000);
      }
      
      console.log("Submitting argument:", messageText, autoSubmit ? "(auto-submitted)" : "");
    }
  };

  const handleJudgingComplete = (winner: 'user' | 'ai') => {
    console.log(`Judge completed for round ${roundNumber}, winner: ${winner}, isRoundJudged: ${isRoundJudged}`);
    
    // Only award points during actual debate phase and if round hasn't been judged
    if (debatePhase === 'debate' && !isRoundJudged) {
      if (winner === 'user') {
        setPlayerScore(prev => prev + 1);
      } else {
        setAiScore(prev => prev + 1);
      }
      
      // Mark this round as judged
      setIsRoundJudged(true);
      console.log(`Points awarded, round ${roundNumber} marked as judged`);
    }
    
    // Reset judge state with a small delay to ensure proper cleanup
    setTimeout(() => {
      setIsJudgeEvaluating(false);
      console.log(`Judge evaluation reset to false`);
    }, 100);
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitArgument();
    }
  };

  // Start prompt timer when user focuses on input during their turn
  const handleInputFocus = () => {
    if (isUserTurn && !isPromptActive) {
      setIsPromptActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rooms
          </Button>

          <motion.div 
            className="flex items-center gap-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-2 text-base border-2 border-yellow text-yellow">
              {roomName}
            </Badge>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className={`text-lg font-mono ${isSessionActive ? 'text-yellow' : 'text-muted-foreground'}`}>
                {formatTime(sessionTimeLeft)}
              </span>
              <span className="text-sm text-muted-foreground">session</span>
            </div>

            {/* Score Counter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">You:</span>
                  <span className="text-lg font-mono text-yellow">{playerScore}</span>
                </div>
                <div className="text-muted-foreground">•</div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">Bot:</span>
                  <span className="text-lg font-mono text-yellow">{aiScore}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Argument Input Section */}
        <motion.div 
          className="max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6 bg-card border-2 border-border">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Input
                  value={argument}
                  onChange={(e) => setArgument(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  placeholder={isUserTurn ? "Enter your argument statement" : "Waiting for AI response..."}
                  className="flex-1 bg-input border-2 border-border text-foreground placeholder:text-muted-foreground focus:border-yellow"
                  disabled={!isUserTurn}
                />
                <Button
                  onClick={() => handleSubmitArgument()}
                  disabled={!isUserTurn}
                  className="bg-yellow text-black hover:opacity-80 transition-opacity"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {!gameStarted && (
                <p className="text-sm text-muted-foreground text-center">
                  Press Enter or click send to start the debate
                </p>
              )}
              
              {gameStarted && !isUserTurn && (
                <p className="text-sm text-muted-foreground text-center">
                  AI is responding...
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Prompt Timer - Only shows during user's turn when active */}
        {isPromptActive && isUserTurn && (
          <motion.div 
            className="max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border-2 border-yellow bg-yellow/10">
                <Clock className="w-5 h-5 text-yellow" />
                <span className="text-2xl font-mono text-yellow">
                  {formatTime(promptTimeLeft)}
                </span>
                <span className="text-sm text-muted-foreground">per prompt</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Timer auto-submits when it reaches 0:00
              </p>
            </div>
          </motion.div>
        )}

        {/* Debate Area */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="min-h-[500px] p-6 bg-card border-2 border-border">
            {!gameStarted ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">Enter your argument to begin</p>
                  <p className="text-sm">The Arguebot is waiting for your challenge...</p>
                </div>
              </div>
            ) : (
              <div 
                ref={messagesContainerRef}
                className="space-y-4 max-h-[400px] overflow-y-auto scroll-smooth"
              >
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-3xl rounded-lg p-4 ${
                        message.sender === 'user' 
                          ? 'bg-yellow/10 border-2 border-yellow/60' 
                          : 'bg-accent border-2 border-border'
                      }`}
                      data-message-sender={message.sender}
                      data-message-index={index}
                    >
                      <p className="text-foreground">{message.text}</p>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {message.sender === 'user' ? 'You' : 'Arguebot'}
                      </span>
                    </div>
                  </div>
                ))}


                
                {/* AI thinking indicator when it's AI's turn */}
                {!isUserTurn && (
                  <div className="flex justify-start">
                    <div className="max-w-3xl bg-accent rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <motion.span 
                          key={currentStatusIndex}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="text-muted-foreground italic"
                        >
                          {thinkingStatuses[currentStatusIndex]}...
                        </motion.span>
                      </div>
                      
                      {/* Mock research sources */}
                      {debatePhase === 'debate' && (
                        <div className="border-t border-border pt-3">
                          <p className="text-xs text-muted-foreground mb-2">Consulting sources:</p>
                          <div className="space-y-1">
                            {mockSources.slice(0, 3).map((source, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.5 }}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="w-3 h-3 text-yellow" />
                                <a 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-yellow hover:text-yellow/80 underline decoration-dotted transition-colors"
                                >
                                  {source.title}
                                </a>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Game Status */}
        {gameStarted && (
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-sm text-muted-foreground">
              Debate in progress • Session: {isSessionActive ? 'Active' : 'Paused'} • Turn: {isUserTurn ? 'Your turn' : 'AI turn'}
              {debateTopic && (
                <>
                  <br />
                  <span className="text-yellow">Topic: {debateTopic}</span>
                </>
              )}
            </p>
          </motion.div>
        )}

        {/* Judge Character */}
        <Judge
          isJudging={isJudgeEvaluating}
          winner={null}
          lastUserMessage={lastUserMessage}
          lastAiMessage={lastAiMessage}
          onJudgingComplete={handleJudgingComplete}
        />
      </div>
    </div>
  );
}