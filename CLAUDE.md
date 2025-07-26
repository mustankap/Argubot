# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Argubot is an AI-powered debate application with two interfaces:
1. **UI/**: A React/TypeScript frontend with sophisticated arena-based debates
2. **argument.html**: A simpler single-file chat interface using Gemini API

## Development Commands

### UI Development (React/TypeScript)
```bash
cd UI
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run build:check  # TypeScript check + build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Deployment
```bash
npm run deploy              # Build and deploy to Netlify
npm run deploy:netlify      # Deploy to Netlify
npm run deploy:vercel       # Deploy to Vercel
npm run deploy:surge        # Deploy to Surge.sh
```

## Architecture

### UI Application Structure
- **App.tsx**: Main component with room selection and arena routing
- **Arena.tsx**: Core debate interface with intelligent AI responses via backend API
- **RoomCard.tsx**: Room selection cards with custom topic input
- **components/ui/**: shadcn/ui component library with Tailwind CSS
- **components/figma/**: Design system components

### Backend API Structure
- **api/debate.ts**: Main DebateAPI class orchestrating analysis and response generation
- **api/utils/analysis.ts**: ArgumentAnalysis service for analyzing user arguments
- **api/utils/strategy.ts**: StrategyService for selecting optimal debate strategies
- **api/utils/responseGenerator.ts**: ResponseGeneratorService for crafting responses
- **api/routes/debate.ts**: API route handlers for frontend integration

### Prompts System
- **prompts/analysis/**: Argument analysis prompts and frameworks
- **prompts/strategies/**: Strategy-specific prompts for different debate approaches
  - socratic-questioning.md: Probing questions to expose reasoning flaws
  - evidence-challenge.md: Questioning data quality and interpretation
  - logical-deconstruction.md: Breaking down argument structure
  - reframe-perspective.md: Presenting alternative viewpoints
  - counter-example.md: Using specific contradictory examples

### Key Features
- **Intelligent AI responses**: Multi-strategy analysis and response generation
- **Argument analysis**: Strength assessment, fallacy detection, weakness identification
- **Strategic selection**: AI chooses optimal debate strategy based on argument type
- **Room-based debates**: Law, Politics, Ethics, Cultural, Technology, plus custom topics
- **Turn-based system**: User and AI alternate with timed responses
- **Session management**: 5-minute overall sessions with 1-minute per-prompt timers
- **Real-time UI**: Framer Motion animations, loading states, auto-submission
- **Smart scoring**: Points awarded based on argument strength and AI confidence

### Tech Stack
- React 18 + TypeScript
- Vite build system
- Tailwind CSS + shadcn/ui components
- Framer Motion for animations
- Lucide React for icons
- Node.js/TypeScript backend API

### State Management
- Local React state (useState/useEffect)
- Backend API calls for AI response generation
- Component-level state for room selection, debate flow, timers

### Styling System
- Tailwind CSS with custom color scheme
- Dark mode by default
- Custom CSS variables: `--yellow`, `--background`, `--foreground`, etc.
- Responsive design with mobile-first approach

## File Structure Patterns
- UI components in `components/` directory
- Reusable UI components in `components/ui/`
- Main application logic in root-level components
- Global styles in `styles/globals.css`

## Development Notes
- The Arena component simulates AI responses - no actual AI integration in UI version
- Timer system auto-submits responses when time expires
- Responsive grid layout for room cards
- Animation delays create staggered loading effects