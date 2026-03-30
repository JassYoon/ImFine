import React from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { ChatRoom } from '../../types';

interface RoomCardProps {
  room: ChatRoom;
  onClick: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-100 p-5 rounded-[32px] flex items-center gap-4 hover:shadow-md transition-all text-left"
    >
      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
        <MessageSquare className="text-orange-500" size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-gray-900 truncate">{room.title}</h3>
        <div className="flex gap-1 mt-1">
          {room.topics.map(topic => (
            <span key={topic} className="text-[10px] font-bold text-gray-400">#{topic}</span>
          ))}
        </div>
      </div>
      <ChevronRight className="text-gray-300" size={20} />
    </button>
  );
};

export default RoomCard;
