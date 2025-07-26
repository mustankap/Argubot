# Argubot UI2

This is the second version of the Argubot UI, built with Vite, React, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

### Building

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Other Commands

- `npm run build:check` - Type check and build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the built application
- `npm run deploy` - Build and deploy to Netlify
- `npm run deploy:vercel` - Deploy to Vercel
- `npm run deploy:surge` - Deploy to Surge

## Project Structure

- `App.tsx` - Main application component
- `components/` - React components
  - `Arena.tsx` - Main debate arena component
  - `Judge.tsx` - AI judge component
  - `RoomCard.tsx` - Room selection cards
  - `ui/` - Reusable UI components
- `styles/` - CSS files
  - `globals.css` - Global styles and Tailwind configuration
- `main.tsx` - Application entry point
- `index.html` - HTML template

## Technologies Used

- **Vite** - Build tool and development server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Radix UI** - Accessible UI primitives
