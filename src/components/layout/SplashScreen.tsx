
import { BrainCircuit, Facebook, Twitter, Youtube, Book } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background overflow-hidden">
      <div className="relative h-48 w-48">
        {/* Main Brain Icon */}
        <BrainCircuit className="absolute inset-0 h-full w-full animate-rotate-zoom text-primary" />

        {/* Splashing Icons */}
        <div className="absolute inset-0 h-full w-full animate-splash-fade-out">
          <Facebook className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-splash-facebook text-blue-500" />
          <Twitter className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-splash-twitter text-sky-400" />
          <Youtube className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-splash-youtube text-red-500" />
          <Book className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-splash-blogger text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
