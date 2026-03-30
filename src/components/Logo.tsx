import { Megaphone } from 'lucide-react';

export default function Logo({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Simple megaphone-like shape using Lucide icon with a background circle */}
        <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 scale-150" />
        <Megaphone className="text-orange-500 relative z-10" size={48} />
      </div>
    </div>
  );
}
