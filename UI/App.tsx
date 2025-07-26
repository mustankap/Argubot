import React, { useState } from "react";
import { RoomCard } from "./components/RoomCard";
import { Arena } from "./components/Arena";
import { Swords, Target, Scale, Vote, Heart, Globe, Cpu, Plus } from "lucide-react";
import { motion } from "motion/react";

const rooms = [
  { name: "Law", icon: Scale },
  { name: "Politics", icon: Vote },
  { name: "Ethics", icon: Heart },
  { name: "Cultural", icon: Globe },
  { name: "Technology", icon: Cpu },
  { name: "Define Your Own", icon: Plus },
];

export default function App() {
  const [currentView, setCurrentView] = useState<'rooms' | 'arena'>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  // Set dark mode
  React.useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleRoomSelect = (roomName: string, customTopic?: string) => {
    const finalRoomName = customTopic || roomName;
    console.log(`Selected room: ${finalRoomName}`);
    setSelectedRoom(finalRoomName);
    setCurrentView('arena');
  };

  const handleBackToRooms = () => {
    setCurrentView('rooms');
    setSelectedRoom('');
  };

  if (currentView === 'arena') {
    return (
      <Arena 
        roomName={selectedRoom} 
        onBack={handleBackToRooms}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center justify-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Swords className="w-8 h-8 text-yellow-muted mr-3" />
            <h1 className="text-4xl md:text-5xl text-foreground">
              Arguebot Arena
            </h1>
            <Target className="w-8 h-8 text-yellow-muted ml-3" />
          </motion.div>

          <motion.div 
            className="space-y-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-xl text-muted-foreground">
              Try your luck against the <span className="text-yellow">arguer</span>
            </p>
            <p className="text-lg text-muted-foreground/80">
              they haven't lost an argument since… ever
            </p>
          </motion.div>
        </motion.div>

        {/* Room Selection Section */}
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl text-center mb-8 text-foreground">
            Select a room below to enter the <span className="text-yellow">arena</span> (no helmets
            provided).
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room, index) => (
              <RoomCard
                key={index}
                title={room.name}
                icon={room.icon}
                index={index}
                onClick={(customTopic) => handleRoomSelect(room.name, customTopic)}
              />
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <p className="text-sm text-muted-foreground/60">
            Choose your battlefield and prepare for intellectual
            combat
          </p>
        </motion.div>
      </div>
    </div>
  );
}