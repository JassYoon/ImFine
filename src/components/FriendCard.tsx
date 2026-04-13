import React from 'react';
import { X, MessageSquarePlus, LogIn, Clock } from 'lucide-react';
import ProfileIcon from './ProfileIcon';
import type { FriendCardData, ChatRoom } from '../types';

interface FriendCardProps {
  friend: FriendCardData;
  pendingRoom?: ChatRoom | null;
  pendingDirection?: 'incoming' | 'outgoing' | null;
  onCreateChat: (friend: FriendCardData) => void;
  onEnterRoom: (room: ChatRoom) => void;
  onCancelInvite: (room: ChatRoom) => void;
  onRemove: (friend: FriendCardData) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  pendingRoom,
  pendingDirection,
  onCreateChat,
  onEnterRoom,
  onCancelInvite,
  onRemove,
}) => {
  return (
    <div className="relative bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm flex flex-col items-center gap-3">
      <button
        onClick={() => onRemove(friend)}
        title="친구 삭제"
        className="absolute top-3 right-3 p-1.5 bg-gray-50 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <X size={14} />
      </button>
      <ProfileIcon
        photoURL={friend.photoURL}
        profileIcon={friend.profileIcon}
        nickname={friend.nickname}
        size={64}
      />
      <p className="text-sm font-black text-gray-900 truncate max-w-full">{friend.nickname}</p>

      {pendingRoom && pendingDirection === 'incoming' ? (
        <button
          onClick={() => onEnterRoom(pendingRoom)}
          className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-200"
        >
          <LogIn size={14} />
          채팅방 입장
        </button>
      ) : pendingRoom && pendingDirection === 'outgoing' ? (
        <button
          onClick={() => onCancelInvite(pendingRoom)}
          className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-gray-200 transition-all"
        >
          <Clock size={14} />
          대기 중 (취소)
        </button>
      ) : (
        <button
          onClick={() => onCreateChat(friend)}
          className="w-full py-2.5 bg-orange-50 text-orange-500 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-orange-100 transition-all"
        >
          <MessageSquarePlus size={14} />
          새 채팅방
        </button>
      )}
    </div>
  );
};

export default FriendCard;
