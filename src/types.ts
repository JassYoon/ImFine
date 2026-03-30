export interface UserProfile {
  uid: string;
  nickname: string;
  email: string;
  photoURL?: string;
  createdAt: any;
  profileIcon?: string; // Color or Emoji string
  bio?: string;
  preferredTime?: number;
  preferredTopics?: string[];
}

export interface FriendRequest {
  id: string;
  from: UserProfile;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: Date;
}

export interface ChatRoom {
  id: string;
  creatorId: string;
  title: string;
  topics: string[];
  timeLimit: number | null; // in seconds, null for unlimited
  createdAt: any;
  lastMessageAt: any;
  participants: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  overtime?: number; // seconds exceeded
  attachmentUrl?: string;
  type: 'text' | 'image' | 'file';
}

export const COMMON_TOPICS = [
  '날씨', '영화', '음악', '운동', '여행', '음식', '반려동물', '취미', '독서', '게임'
];

export const TIME_RANGES = [
  { label: '부담없이', min: 10800, max: null }, // 3h ~ Unlimited
  { label: '느긋하게', min: 3600, max: 10800 }, // 1h ~ 3h
  { label: '빨리', min: 600, max: 1800 },      // 10m ~ 30m
  { label: '바로', min: 0, max: 300 },         // 0 ~ 5m
];
