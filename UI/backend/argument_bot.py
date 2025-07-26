"""
Mock SassyArgumentBot for deployment
"""
import asyncio
import time
from typing import Tuple

class ArgumentSession:
    def __init__(self):
        self.user_points = 0
        self.bot_points = 0
        self.is_active = True
        self.start_time = time.time()
        self.duration = 300  # 5 minutes
    
    @property
    def time_remaining(self):
        elapsed = time.time() - self.start_time
        remaining = max(0, self.duration - elapsed)
        if remaining == 0:
            self.is_active = False
        return int(remaining)

class SassyArgumentBot:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = None
    
    async def start_new_session(self):
        """Start a new argument session"""
        self.session = ArgumentSession()
    
    async def get_bot_response(self, user_message: str) -> str:
        """Get a sassy response from Sir Interruptsalot"""
        await asyncio.sleep(0.1)  # Simulate API call
        
        sassy_responses = [
            f"Oh please, '{user_message}'? That's the best you can do? I've heard more convincing arguments from my toaster.",
            f"Let me interrupt you right there - '{user_message}' is exactly the kind of thinking that got us into this mess in the first place!",
            f"ACTUALLY, '{user_message}' is completely wrong, and here's why you should probably just stick to watching cat videos...",
            f"I'm sorry, did you just say '{user_message}'? Because that's absolutely hilarious if you actually believe that nonsense.",
            f"Hold up, hold up - '{user_message}'? That's not an argument, that's just wishful thinking with extra steps!",
        ]
        
        import random
        return random.choice(sassy_responses)
    
    async def judge_argument_round(self, user_message: str, bot_response: str) -> Tuple[int, int, str]:
        """Judge the argument round and award points"""
        await asyncio.sleep(0.1)  # Simulate judging
        
        # Simple scoring logic
        user_points = len(user_message.split()) // 5  # Points for longer arguments
        bot_points = 3  # Bot always gets some points for sass
        
        self.session.user_points += user_points
        self.session.bot_points += bot_points
        
        explanations = [
            f"Sir Interruptsalot gets {bot_points} points for superior sass levels. You get {user_points} points for trying.",
            f"The bot wins {bot_points} points for interruption technique. You earn {user_points} points for persistence.",
            f"Sir Interruptsalot scores {bot_points} points for creative dismissal. You get {user_points} points for effort.",
        ]
        
        import random
        explanation = random.choice(explanations)
        
        return user_points, bot_points, explanation
    
    def get_time_remaining(self) -> int:
        """Get remaining time in session"""
        if not self.session:
            return 0
        return self.session.time_remaining
    
    async def end_session(self) -> str:
        """End session and return final report"""
        if not self.session:
            return "No session to end!"
        
        self.session.is_active = False
        
        if self.session.user_points > self.session.bot_points:
            result = "🎉 Congratulations! You out-argued Sir Interruptsalot!"
        elif self.session.bot_points > self.session.user_points:
            result = "😏 Sir Interruptsalot wins! Better luck next time!"
        else:
            result = "🤝 It's a tie! You're equally stubborn!"
        
        return f"""
🏁 **FINAL RESULTS** 🏁

{result}

📊 **Final Scores:**
• You: {self.session.user_points} points
• Sir Interruptsalot: {self.session.bot_points} points

Thanks for playing with Sir Interruptsalot! 🎭
"""
