import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface JudgeProps {
  isJudging: boolean;
  winner: 'user' | 'ai' | null;
  lastUserMessage: string;
  lastAiMessage: string;
  onJudgingComplete: (winner: 'user' | 'ai') => void;
}

const JudgeFace = ({ expression }: { expression: 'neutral' | 'positive' | 'negative' | 'thinking' }) => {
  const faceStyles = {
    neutral: { eyes: "• •", mouth: "—", color: "text-muted-foreground" },
    positive: { eyes: "^ ^", mouth: "◡", color: "text-green-400" },
    negative: { eyes: "• •", mouth: "◦", color: "text-red-400" },
    thinking: { eyes: "◔ ◔", mouth: "○", color: "text-yellow" }
  };

  const face = faceStyles[expression];

  return (
    <motion.div
      className={`text-4xl font-mono ${face.color} transition-colors duration-300`}
      key={expression}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center leading-none">
        <div className="mb-1">{face.eyes}</div>
        <div>{face.mouth}</div>
      </div>
    </motion.div>
  );
};

const LollipopSign = ({ winner, show }: { winner: 'user' | 'ai', show: boolean }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.6 }}
          className="absolute -right-16 top-1/2 -translate-y-1/2"
        >
          {/* Lollipop stick */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-1 h-12 bg-amber-600 rounded-full"></div>
          
          {/* Lollipop sign */}
          <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xl ${
            winner === 'user' ? 'bg-green-400' : 'bg-blue-400'
          }`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.8 }}
              className="text-white font-bold"
            >
              {winner === 'user' ? '👤' : '🤖'}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type JudgePosition = {
  x: number;
  y: number;
};

export function Judge({ isJudging, winner, lastUserMessage, lastAiMessage, onJudgingComplete }: JudgeProps) {
  const [currentExpression, setCurrentExpression] = useState<'neutral' | 'positive' | 'negative' | 'thinking'>('neutral');
  const [showLollipop, setShowLollipop] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<'user' | 'ai' | null>(null);
  const [isJudgingActive, setIsJudgingActive] = useState(false);
  const [judgePosition, setJudgePosition] = useState<JudgePosition>({ x: 0, y: 0 });
  const [judgingPhase, setJudgingPhase] = useState<'idle' | 'moving-to-ai' | 'reading-ai' | 'moving-to-user' | 'reading-user' | 'returning-home'>('idle');

  // Calculate positions for AI and user messages
  const getMessagePositions = () => {
    // Find the latest AI message (left side)
    const aiMessageElements = document.querySelectorAll('[data-message-sender="ai"]');
    const latestAiElement = aiMessageElements[aiMessageElements.length - 1] as HTMLElement;
    
    // Find the latest user message (right side) 
    const userMessageElements = document.querySelectorAll('[data-message-sender="user"]');
    const latestUserElement = userMessageElements[userMessageElements.length - 1] as HTMLElement;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let aiPosition = { x: 100, y: 300 };
    let userPosition = { x: viewport.width - 200, y: 400 };

    if (latestAiElement) {
      const rect = latestAiElement.getBoundingClientRect();
      aiPosition = {
        x: Math.max(20, rect.left - 140), // Position to the left, but stay on screen
        y: Math.max(100, rect.top + rect.height / 2 - 50) // Center vertically on message
      };
    }

    if (latestUserElement) {
      const rect = latestUserElement.getBoundingClientRect();
      userPosition = {
        x: Math.min(viewport.width - 140, rect.right + 20), // Position to the right, but stay on screen  
        y: Math.max(100, rect.top + rect.height / 2 - 50) // Center vertically on message
      };
    }

    return { aiPosition, userPosition };
  };

  // Judge expressions sequence when evaluating messages
  useEffect(() => {
    console.log(`Judge useEffect triggered: isJudging=${isJudging}, isJudgingActive=${isJudgingActive}`);
    
    if (!isJudging) {
      // Reset all states when not judging
      console.log('Judge not needed, resetting states');
      setCurrentExpression('neutral');
      setShowLollipop(false);
      setCurrentWinner(null);
      setIsJudgingActive(false);
      setJudgingPhase('idle');
      return;
    }

    // Don't start a new sequence if one is already active
    if (isJudgingActive) {
      console.log('Judge already active, skipping new sequence');
      return;
    }

    console.log('Starting new judge sequence');
    setIsJudgingActive(true);

    const judgingSequence = async () => {
      const { aiPosition, userPosition } = getMessagePositions();
      
      // Phase 1: Move to AI message and evaluate it
      setJudgingPhase('moving-to-ai');
      setCurrentExpression('thinking');
      setJudgePosition(aiPosition);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Time for movement

      // Phase 2: Read and react to AI message
      setJudgingPhase('reading-ai');
      await new Promise(resolve => setTimeout(resolve, 500));
      const aiReaction = Math.random() > 0.5 ? 'positive' : 'negative';
      setCurrentExpression(aiReaction);
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Phase 3: Move to user message
      setJudgingPhase('moving-to-user');
      setCurrentExpression('thinking');
      setJudgePosition(userPosition);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Time for movement

      // Phase 4: Read and react to user message
      setJudgingPhase('reading-user');
      await new Promise(resolve => setTimeout(resolve, 500));
      const userReaction = Math.random() > 0.5 ? 'positive' : 'negative';
      setCurrentExpression(userReaction);
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Phase 5: Return to right side while making final decision
      setJudgingPhase('returning-home');
      setCurrentExpression('thinking');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Think while moving back

      // Determine winner (random for demo, but in real app would be based on actual evaluation)
      const judgedWinner = Math.random() > 0.5 ? 'user' : 'ai';
      setCurrentWinner(judgedWinner);
      
      // Show positive expression for winner
      setCurrentExpression('positive');
      setShowLollipop(true);
      
      // Notify parent component
      onJudgingComplete(judgedWinner);

      // Keep showing result for a moment
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Reset to idle state
      setCurrentExpression('neutral');
      setShowLollipop(false);
      setCurrentWinner(null);
      setIsJudgingActive(false);
      setJudgingPhase('idle');
    };

    // Small delay to ensure DOM is ready
    setTimeout(judgingSequence, 100);
  }, [isJudging, onJudgingComplete]);

  // Default position (right side, center)
  const defaultPosition = {
    x: typeof window !== 'undefined' ? window.innerWidth - 140 : 800,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 50 : 300
  };

  const currentPosition = (judgingPhase === 'idle' || judgingPhase === 'returning-home') ? defaultPosition : judgePosition;

  return (
    <motion.div
      className="fixed z-50"
      style={{
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`
      }}
      initial={{ x: 100, opacity: 0 }}
      animate={{ 
        x: 0,
        y: 0,
        opacity: 1 
      }}
      transition={{ 
        type: "spring", 
        duration: judgingPhase === 'idle' ? 0.8 : judgingPhase === 'returning-home' ? 1.0 : 1.2,
        damping: 15,
        stiffness: 80
      }}
    >
      <div className="relative">
        {/* Judge Character */}
        <motion.div
          animate={{ 
            y: judgingPhase === 'reading-ai' || judgingPhase === 'reading-user' ? [-4, -12, -4] : [0, -8, 0],
            rotate: [0, 2, -2, 0],
            scale: judgingPhase === 'reading-ai' || judgingPhase === 'reading-user' ? [1, 1.05, 1] : 1
          }}
          transition={{ 
            duration: judgingPhase === 'reading-ai' || judgingPhase === 'reading-user' ? 1.5 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`bg-card border-4 border-yellow rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-xl relative transition-all duration-500 ${
            judgingPhase === 'reading-ai' || judgingPhase === 'reading-user' 
              ? 'shadow-2xl shadow-yellow/30 border-yellow/80' 
              : ''
          }`}
        >
          {/* Judge wig/hat */}
          <div className="absolute -top-6 w-20 h-6 bg-gray-800 rounded-t-full border-2 border-yellow"></div>
          
          {/* Judge face */}
          <AnimatePresence mode="wait">
            <JudgeFace expression={currentExpression} />
          </AnimatePresence>
          
          {/* Judge robe collar */}
          <div className="absolute -bottom-2 w-16 h-4 bg-gray-900 rounded-b-lg border-2 border-yellow"></div>
        </motion.div>

        {/* Thinking bubble when reading messages */}
        {(judgingPhase === 'reading-ai' || judgingPhase === 'reading-user') && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="absolute -top-12 -right-8"
          >
            <div className="bg-white/90 text-black text-xs rounded-lg px-2 py-1 shadow-lg border-2 border-yellow relative">
              <span className="font-mono">
                {judgingPhase === 'reading-ai' ? '🤖📖' : '👤📖'}
              </span>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-1 left-4 w-3 h-3 bg-white/90 border-r-2 border-b-2 border-yellow transform rotate-45"></div>
            </div>
          </motion.div>
        )}

        {/* Gavel when thinking */}
        {currentExpression === 'thinking' && judgingPhase !== 'reading-ai' && judgingPhase !== 'reading-user' && (
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -20, 0, 20, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="absolute -left-8 top-4"
          >
            <div className="w-2 h-8 bg-amber-600 rounded-full rotate-45"></div>
            <div className="w-6 h-3 bg-gray-800 rounded-sm -mt-2 ml-1"></div>
          </motion.div>
        )}

        {/* Lollipop sign */}
        {currentWinner && (
          <LollipopSign winner={currentWinner} show={showLollipop} />
        )}

        {/* Judge label */}
        <motion.div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-yellow/10 border border-yellow rounded px-2 py-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-xs text-yellow font-medium">Judge</span>
        </motion.div>
      </div>
    </motion.div>
  );
}