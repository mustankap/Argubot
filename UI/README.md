# Argubot UI - Deployment Guide

A React/TypeScript application for the Argubot interface.

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Deploy
```bash
./deploy.sh
```

## Deployment Options

### 1. Netlify (Recommended - Easiest)
1. Run `npm run build`
2. Go to [netlify.com/drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the page
4. Your app goes live instantly!

### 2. Vercel (Great for React)
```bash
npm i -g vercel
npm run build
npx vercel --prod
```

### 3. Surge.sh (Simple)
```bash
npm i -g surge
npm run build
npx surge dist/
```

### 4. GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select "Deploy from a branch"
4. Choose your branch and `/dist` folder

### 5. Manual Hosting
1. Run `npm run build`
2. Upload contents of `dist/` folder to any web hosting service

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Project Structure

```
UI/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Arena.tsx       # Game arena component
│   └── RoomCard.tsx    # Room selection component
├── styles/             # Global styles
├── App.tsx             # Main app component
└── main.tsx           # Entry point
```

## Build Output

The build creates a `dist/` folder with:
- Optimized JavaScript bundles
- CSS files
- Static assets
- `index.html` entry point

These files can be deployed to any static hosting service.
