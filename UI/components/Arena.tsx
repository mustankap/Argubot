import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ArrowLeft, Clock, Send, Trophy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface ArenaProps {
  roomName: string;
  onBack: () => void;
  initialUserMessage?: string;
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

export function Arena({ roomName, onBack, initialUserMessage }: ArenaProps) {
  const [argument, setArgument] = useState("");
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai'}>>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [debateTopic, setDebateTopic] = useState(roomName);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [finalReport, setFinalReport] = useState<string | null>(null);
  const [currentJudgeRuling, setCurrentJudgeRuling] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  // Auto-start with initial message
  useEffect(() => {
    if (initialUserMessage && !gameStarted) {
      startArgumentSession(initialUserMessage);
    }
  }, [initialUserMessage, gameStarted]);

  // API Functions
  const startArgumentSession = async (initialMessage: string) => {
    try {
      setIsAiThinking(true);
      setGameStarted(true);
      setIsSessionActive(true);
      setMessages([{ text: initialMessage, sender: 'user' }]);
      
      const response = await fetch(`${API_BASE_URL}/api/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_message: initialMessage })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start session');
      }
      
      const data = await response.json();
      setSessionId(data.session_id);
      setIsAiThinking(false);
      
      // Add welcome instructions first
      const welcomeMessage = `🔥 **WELCOME TO Sir Interruptsalot!** 🔥

**Rules of Engagement:**
• 🕐 You have **5 minutes** to argue with me
• 📊 A judge AI will pick the winner of each round (+1 point)
• 🏆 Most points wins!
• 📝 After the argument, you'll get a snarky personality report

**How to Play:**
1. Give me your strongest opinion about ANYTHING
2. I'll disagree and we'll argue back and forth
3. Win rounds with logic, wit, and creativity
4. Have fun and don't take it personally! 😏

---

${data.message}`;
      
      setMessages(prev => [...prev, { text: welcomeMessage, sender: 'ai' }]);
      setIsUserTurn(true);
    } catch (error) {
      console.error('Error starting session:', error);
      setIsAiThinking(false);
      setMessages(prev => [...prev, { 
        text: 'Sorry, I had trouble connecting to my interrupting brain. Please try again!',
        sender: 'ai' 
      }]);
    }
  };

  const sendArgumentToAPI = async (message: string) => {
    if (!sessionId) return;
    
    try {
      setIsAiThinking(true);
      setIsUserTurn(false);
      
      // Clear previous judge ruling and status for new round
      setCurrentJudgeRuling(null);
      setCurrentStatus(null);
      
      const response = await fetch(`${API_BASE_URL}/api/argument`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId, 
          message: message 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send argument');
      }
      
      const data = await response.json();
      setIsAiThinking(false);
      
      // Update scores
      setPlayerScore(data.user_points);
      setAiScore(data.bot_points);
      setSessionTimeLeft(data.time_remaining);
      
      // Add ONLY bot response to chat
      setMessages(prev => [...prev, { text: data.bot_response, sender: 'ai' }]);
      
      // Update separate UI boxes for judge and status
      if (data.judge_explanation && data.judge_explanation !== "Judge had technical difficulties, no points awarded this round.") {
        setCurrentJudgeRuling(data.judge_explanation);
      }
      
      if (data.status_update) {
        setCurrentStatus(data.status_update);
      }
      
      // Check if session ended
      if (!data.session_active) {
        setIsSessionActive(false);
        await endSession();
      } else {
        setIsUserTurn(true);
      }
    } catch (error) {
      console.error('Error sending argument:', error);
      setIsAiThinking(false);
      setMessages(prev => [...prev, { 
        text: 'Oops! My interrupting circuits got crossed. Try that again!',
        sender: 'ai' 
      }]);
      setIsUserTurn(true);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/end`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFinalReport(data.final_report);
        setGameEnded(true);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  // Session timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isSessionActive && sessionTimeLeft > 0) {
      interval = setInterval(() => {
        setSessionTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsSessionActive(false);
            endSession();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, sessionTimeLeft]);



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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



  const handleSubmitArgument = () => {
    if (argument.trim() && isUserTurn && sessionId) {
      const messageText = argument.trim();
      
      // Add user message to conversation
      setMessages(prev => [...prev, { text: messageText, sender: 'user' }]);
      setArgument("");
      
      // Send to API
      sendArgumentToAPI(messageText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitArgument();
    }
  };



  // Show final report if game ended
  if (gameEnded && finalReport) {
    return (
      <div className="min-h-screen bg-black text-white" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Start
            </Button>
            
            <Card className="p-8 bg-card border-2 border-yellow" style={{ backgroundColor: '#0a0a0a', borderColor: '#ffcd1a' }}>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-yellow mb-4" style={{ color: '#ffcd1a' }}>🎉 Game Over! 🎉</h1>
                <div className="flex justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow" style={{ color: '#ffcd1a' }}>{playerScore}</div>
                    <div className="text-sm text-muted-foreground">Your Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow" style={{ color: '#ffcd1a' }}>{aiScore}</div>
                    <div className="text-sm text-muted-foreground">AI Points</div>
                  </div>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: finalReport.replace(/\n/g, '<br/>') }} />
              </div>
              
              <div className="text-center mt-8">
                <Button 
                  onClick={onBack}
                  className="bg-yellow hover:bg-yellow-muted text-black font-semibold px-8 py-3"
                  style={{ backgroundColor: '#ffcd1a', color: '#000000' }}
                >
                  Start New Argument
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
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
            Back to Start
          </Button>

          <motion.div 
            className="flex items-center gap-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge variant="outline" className="px-4 py-2 text-base border-2 border-yellow text-yellow bg-yellow/10 shadow-lg shadow-yellow/20">
              {debateTopic}
            </Badge>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className={`text-lg font-mono ${isSessionActive ? 'text-yellow' : 'text-muted-foreground'}`}>
                {formatTime(sessionTimeLeft)}
              </span>
              <span className="text-sm text-muted-foreground">session</span>
            </div>

            {/* Score Counter - only show after game starts */}
            {gameStarted && (
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
            )}
          </motion.div>
        </motion.div>

        {/* Main Content Area - Chat + Judge Sidebar */}
        <motion.div 
          className="max-w-7xl mx-auto relative flex gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Debate Area - Left Side (Main Chat) */}
          <div className="flex-1">
            <Card className="min-h-[500px] p-6 bg-card border-2 border-border">
              {!gameStarted ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg mb-2">Enter your argument to begin</p>
                    <p className="text-sm">The Arguebot is waiting for your challenge...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl rounded-lg p-4 relative ${
                        message.sender === 'user' 
                          ? 'bg-yellow/10 border-2 border-yellow/60' 
                          : 'bg-accent border-2 border-border'
                      }`} style={{ 
                        backgroundColor: message.sender === 'user' 
                          ? 'rgba(255, 205, 26, 0.1)' 
                          : '#1a1a1a' 
                      }}>
                        <div className="text-foreground whitespace-pre-wrap">
                          {message.text.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className={lineIndex > 0 ? 'mt-3' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                        

                        
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
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Judge Insight Box - Right Sidebar */}
          {currentJudgeRuling && (
            <motion.div 
              className="w-80 sticky top-8 h-fit"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-2 border-purple-500/50" 
                    style={{ backgroundColor: 'rgba(75, 0, 130, 0.1)', borderColor: 'rgba(147, 51, 234, 0.5)' }}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="text-xl">🧑‍⚖️</div>
                    <h3 className="text-purple-300 font-semibold text-sm">JUDGE'S INSIGHT</h3>
                  </div>
                  <div className="h-px bg-purple-500/30"></div>
                  <p className="text-white text-sm leading-relaxed">{currentJudgeRuling}</p>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Status Update Box - Hidden (scores shown in header) */}
        {/* {currentStatus && (
          <motion.div 
            className="max-w-4xl mx-auto mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-4 bg-gradient-to-r from-green-900/20 to-teal-900/20 border-2 border-green-500/50"
                  style={{ backgroundColor: 'rgba(0, 100, 0, 0.1)', borderColor: 'rgba(34, 197, 94, 0.5)' }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl">📊</div>
                <div className="flex-1">
                  <h3 className="text-green-300 font-semibold text-sm mb-2">ARGUMENT STATUS</h3>
                  <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">{currentStatus}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )} */}

        {/* Chat Input Section - Moved to Bottom */}
        <motion.div 
          className="max-w-7xl mx-auto mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-4 bg-card border-2 border-border" style={{ backgroundColor: '#0a0a0a', borderColor: '#262626' }}>
            <div className="flex gap-4 items-center">
              <Input
                value={argument}
                onChange={(e) => setArgument(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isUserTurn ? "Type your argument here..." : "Waiting for AI response..."}
                className="flex-1 bg-input border-2 border-border text-foreground placeholder:text-muted-foreground focus:border-yellow"
                style={{ backgroundColor: '#1a1a1a', borderColor: '#262626', color: '#ffffff' }}
                disabled={!isUserTurn}
              />
              <Button
                onClick={() => handleSubmitArgument()}
                disabled={!isUserTurn}
                className="bg-yellow text-black hover:opacity-80 transition-opacity px-6"
                style={{ backgroundColor: '#ffcd1a', color: '#000000' }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {!gameStarted && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Press Enter or click send to start debating
              </p>
            )}
            
            {gameStarted && !isUserTurn && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                AI is thinking... Please wait
              </p>
            )}
          </Card>
        </motion.div>

        {/* Game Status */}
        {gameStarted && (
          <motion.div 
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-sm text-muted-foreground">
              Debate in progress • Session: {isSessionActive ? 'Active' : 'Paused'} • Turn: {isUserTurn ? 'Your turn' : 'AI turn'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}