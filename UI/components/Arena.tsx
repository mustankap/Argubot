import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ArrowLeft, Clock, Send } from "lucide-react";
import { motion } from "motion/react";

interface ArenaProps {
  roomName: string;
  onBack: () => void;
}

export function Arena({ roomName, onBack }: ArenaProps) {
  const [argument, setArgument] = useState("");
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300); // 5 minute session timer
  const [promptTimeLeft, setPromptTimeLeft] = useState(60); // 1 minute prompt timer
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPromptActive, setIsPromptActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(true); // Track whose turn it is
  const [messages, setMessages] = useState<Array<{text: string, sender: 'user' | 'ai'}>>([]);

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
      
      // Simulate AI response after a delay
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: `I disagree with "${messageText}". Here's my counterargument...`, 
          sender: 'ai' 
        }]);
        
        // After AI responds, it becomes user's turn again
        setTimeout(() => {
          setIsUserTurn(true);
          setPromptTimeLeft(60); // Reset timer for new prompt
        }, 1000);
      }, 2000);
      
      console.log("Submitting argument:", messageText, autoSubmit ? "(auto-submitted)" : "");
    }
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
            className="flex items-center gap-4"
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
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl rounded-lg p-4 ${
                      message.sender === 'user' 
                        ? 'bg-yellow/10 border-2 border-yellow/60' 
                        : 'bg-accent border-2 border-border'
                    }`}>
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
                    <div className="max-w-3xl bg-accent rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-muted-foreground">Arguebot is thinking...</span>
                      </div>
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
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}