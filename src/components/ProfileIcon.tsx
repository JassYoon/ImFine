import React from 'react';
import { Megaphone } from 'lucide-react';

interface ProfileIconProps {
  photoURL?: string;
  profileIcon?: string;
  nickname?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  yellow: 'bg-yellow-400 text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-400 text-white',
  green: 'bg-green-400 text-white',
  blue: 'bg-blue-400 text-white',
  pink: 'bg-pink-400 text-white',
  white: 'bg-white text-gray-700 border border-gray-200',
  gray: 'bg-gray-200 text-gray-400',
};

const ProfileIcon: React.FC<ProfileIconProps> = ({
  photoURL,
  profileIcon,
  nickname,
  size = 40,
  className = '',
  onClick,
}) => {
  const style = { width: size, height: size, fontSize: size * 0.45 };
  const isColor = profileIcon && COLOR_MAP[profileIcon];
  const isEmoji = profileIcon && !isColor;
  const useDefault = !photoURL && !isColor && !isEmoji;
  const base = 'rounded-full flex items-center justify-center font-black overflow-hidden flex-shrink-0 select-none';
  const colorClass = isColor
    ? COLOR_MAP[profileIcon!]
    : useDefault
      ? 'bg-orange-50 text-orange-500'
      : 'bg-gray-100 text-gray-400';
  const clickable = onClick ? 'cursor-pointer hover:ring-2 hover:ring-orange-200 transition-all' : '';

  return (
    <div
      onClick={onClick}
      style={style}
      className={`${base} ${colorClass} ${clickable} ${className}`}
    >
      {photoURL ? (
        <img src={photoURL} alt={nickname || 'profile'} className="w-full h-full object-cover" />
      ) : isEmoji ? (
        <span>{profileIcon}</span>
      ) : isColor && nickname ? (
        <span>{nickname[0]?.toUpperCase()}</span>
      ) : (
        <Megaphone size={size * 0.5} />
      )}
    </div>
  );
};

export default ProfileIcon;
