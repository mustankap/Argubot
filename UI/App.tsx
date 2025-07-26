import React, { useState } from "react";
import { Arena } from "./components/Arena";
import { Swords, Target, Send, Zap, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";

export default function App() {
  const [currentView, setCurrentView] = useState<'start' | 'arena'>('start');
  const [userArgument, setUserArgument] = useState<string>('');

  // Set dark mode
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleStartArgument = () => {
    if (userArgument.trim()) {
      setCurrentView('arena');
    }
  };

  const handleBackToStart = () => {
    setCurrentView('start');
    setUserArgument('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleStartArgument();
    }
  };

  if (currentView === 'arena') {
    return (
      <Arena 
        roomName="General"
        onBack={handleBackToStart}
        initialUserMessage={userArgument}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center justify-center mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Swords className="w-10 h-10 text-yellow mr-4 drop-shadow-lg" style={{ color: '#ffcd1a' }} />
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-yellow drop-shadow-lg tracking-wider" style={{ color: '#ffcd1a' }}>
                Sir Interruptsalot
              </h1>
              <p className="text-lg md:text-xl text-yellow-muted mt-2 font-medium tracking-wide" style={{ color: '#fbbf24' }}>
                Smart AI System with Sassy Yields
              </p>
            </div>
            <Target className="w-10 h-10 text-yellow ml-4 drop-shadow-lg" style={{ color: '#ffcd1a' }} />
          </motion.div>

          <motion.div 
            className="space-y-6 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl text-foreground font-semibold">
              Ready to argue with the undefeated champion? 
            </h2>
            <p className="text-lg text-muted-foreground">
              Bring your <span className="text-yellow font-semibold">strongest opinion</span> and let's see if you can out-argue an AI that's never lost a debate
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow drop-shadow-sm" />
                <span>5-minute rounds</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow drop-shadow-sm" />
                <span>Judge picks winner (+1 point)</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-yellow drop-shadow-sm" />
                <span>Personality report at end</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Argument Input Section */}
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-8 border-2 border-yellow/30 bg-card/80 backdrop-blur-sm shadow-2xl shadow-yellow/10" style={{ backgroundColor: '#0a0a0a', borderColor: '#ffcd1a' }}>
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">What's your strongest take?</h3>
                <p className="text-muted-foreground">
                  Give me your strongest opinion about ANYTHING and I'll disagree with everything you say.
                  Logic, wit, and creativity will win you points! 🔥
                </p>
              </div>
              
              <div className="space-y-4">
                <textarea
                  value={userArgument}
                  onChange={(e) => setUserArgument(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your argument here... (e.g., 'Pineapple on pizza is actually amazing and anyone who disagrees has no taste')"
                  className="w-full h-32 px-4 py-3 bg-input border border-border rounded-lg resize-none text-base focus:ring-2 focus:ring-yellow focus:border-yellow transition-all placeholder:text-muted-foreground/60 text-foreground"
                  style={{ backgroundColor: '#1a1a1a', borderColor: '#262626', color: '#ffffff' }}
                />
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Ctrl/Cmd + Enter to start arguing
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {userArgument.length}/500
                  </div>
                </div>
                
                <Button 
                  onClick={handleStartArgument}
                  disabled={!userArgument.trim()}
                  className="w-full bg-yellow hover:bg-yellow-muted text-black font-semibold py-3 text-base transition-all transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50 shadow-lg shadow-yellow/20"
                  style={{ backgroundColor: '#ffcd1a', color: '#000000' }}
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Start the Argument!
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p className="text-sm text-muted-foreground/60">
            Warning: This AI is programmed to disagree with everything you say. Prepare for maximum sass! 😏
          </p>
        </motion.div>
      </div>
    </div>
  );
}