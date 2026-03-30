import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Clock, Hash, ChevronRight, Paperclip, Send, X, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMMON_TOPICS, TIME_RANGES, ChatRoom, Message } from '../types';

export default function TextChat() {
  const [activeTab, setActiveTab] = useState<'my' | 'search'>('my');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedSearchTopics, setSelectedSearchTopics] = useState<string[]>([]);
  const [waitingRooms, setWaitingRooms] = useState<ChatRoom[]>([
    {
      id: 'w1',
      creatorId: 'me',
      title: '같이 점심 드실 분?',
      topics: ['음식', '일상'],
      timeLimit: 3600,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      participants: ['me']
    }
  ]);

  const handleCreateRoom = (newRoom: ChatRoom) => {
    setWaitingRooms(prev => [newRoom, ...prev]);
    setIsCreating(false);
  };

  const handleAddCustomTopic = () => {
    if (customTopic.trim()) {
      setSelectedTopics(prev => [...prev, customTopic.trim()]);
      setCustomTopic('');
      setIsAddingCustom(false);
    }
  };

  // Mock data for initial UI
  const [myRooms] = useState<ChatRoom[]>([
    {
      id: '1',
      creatorId: 'user1',
      title: '오늘 날씨 어때요?',
      topics: ['날씨', '일상'],
      timeLimit: 3600,
      createdAt: new Date(Date.now() - 100000),
      lastMessageAt: new Date(),
      participants: ['user1', 'user2']
    }
  ]);

  const [searchRooms] = useState<ChatRoom[]>([
    {
      id: '2',
      creatorId: 'user3',
      title: '영화 추천해주세요!',
      topics: ['영화', '취미'],
      timeLimit: 1800,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      participants: ['user3']
    }
  ]);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Top Tab Bar */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === 'search' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'
          }`}
        >
          채팅 찾기
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
            activeTab === 'my' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'
          }`}
        >
          나의 채팅
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
        {activeTab === 'my' ? (
          <div className="space-y-4">
            {myRooms.length === 0 ? (
              <div className="bg-white border border-gray-100 p-12 rounded-[40px] text-center space-y-4 shadow-sm">
                <p className="text-gray-400 font-bold">진행 중인 채팅이 없습니다.<br/>새로운 대화를 시작해보세요!</p>
              </div>
            ) : (
              myRooms
                .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
                .map(room => (
                  <RoomCard key={room.id} room={room} onClick={() => setSelectedRoom(room)} />
                ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Waiting for Friends Section */}
            {waitingRooms.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-sm font-black text-gray-900">친구를 기다리고 있습니다</h4>
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                    {waitingRooms.length}개 개설됨
                  </span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                  {waitingRooms.map(room => (
                    <div key={room.id} className="min-w-[280px] snap-center bg-white border border-orange-100 p-5 rounded-[32px] shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                          <Clock size={20} className="text-orange-500" />
                        </div>
                        <span className="text-[10px] font-black text-gray-400">대기 중...</span>
                      </div>
                      <h3 className="font-black text-gray-900 truncate">{room.title}</h3>
                      <div className="flex gap-1">
                        {room.topics.map(t => <span key={t} className="text-[9px] font-bold text-gray-400">#{t}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Button */}
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-5 bg-orange-500 text-white rounded-[32px] font-black flex items-center justify-center gap-3 shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
            >
              <Plus size={24} />
              <span>새로운 채팅방 만들기</span>
            </button>

            {/* Search Filters */}
            <div className="space-y-6 bg-white p-6 rounded-[40px] border border-gray-50 shadow-sm">
              <div className="space-y-3">
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Clock size={16} className="text-orange-500" />
                  대화 제한시간
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_RANGES.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setSelectedRange(prev => prev === range.label ? null : range.label)}
                      className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all ${
                        selectedRange === range.label
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100'
                          : 'bg-gray-50 text-gray-500 border-transparent hover:bg-orange-50 hover:text-orange-500'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <Hash size={16} className="text-orange-500" />
                  관심 주제
                </h4>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TOPICS.map(topic => (
                    <button
                      key={topic}
                      onClick={() => setSelectedSearchTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        selectedSearchTopics.includes(topic)
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-100'
                          : 'bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-500'
                      }`}
                    >
                      #{topic}
                    </button>
                  ))}
                  {isAddingCustom ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="주제 입력..."
                        className="flex-1 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold outline-none border-2 border-orange-200"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTopic()}
                      />
                      <button onClick={handleAddCustomTopic} className="p-2 bg-orange-500 text-white rounded-full">
                        <Plus size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsAddingCustom(true)}
                      className="px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-400 hover:bg-gray-200 transition-all"
                    >
                      + 직접 입력
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">추천 채팅방</h4>
              {searchRooms.map(room => (
                <RoomCard key={room.id} room={room} onClick={() => setSelectedRoom(room)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isCreating && (
          <CreateRoomModal 
            onClose={() => setIsCreating(false)} 
            onCreate={handleCreateRoom}
          />
        )}
        {selectedRoom && <ChatRoomView room={selectedRoom} onClose={() => setSelectedRoom(null)} />}
      </AnimatePresence>
    </div>
  );
}

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
}

function CreateRoomModal({ onClose, onCreate }: { onClose: () => void; onCreate: (room: ChatRoom) => void }) {
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState<{ h: number; m: number; s: number }>({ h: 0, m: 10, s: 0 });

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const totalSeconds = timeLimit.h * 3600 + timeLimit.m * 60 + timeLimit.s;
    const newRoom: ChatRoom = {
      id: Date.now().toString(),
      creatorId: 'me',
      title: title.trim(),
      topics: selectedTopics,
      timeLimit: totalSeconds,
      createdAt: new Date(),
      lastMessageAt: new Date(),
      participants: ['me']
    };
    
    onCreate(newRoom);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white w-full max-w-lg rounded-[40px] p-8 space-y-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">채팅방 만들기</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-black text-gray-900">방 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="어떤 대화를 나누고 싶나요?"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-gray-900">발송 제한시간 (최대 24시간)</label>
            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl justify-center">
              <TimePickerUnit value={timeLimit.h} label="시" onChange={(v) => setTimeLimit(prev => ({ ...prev, h: v }))} max={23} />
              <span className="text-2xl font-black text-gray-300">:</span>
              <TimePickerUnit value={timeLimit.m} label="분" onChange={(v) => setTimeLimit(prev => ({ ...prev, m: v }))} max={59} />
              <span className="text-2xl font-black text-gray-300">:</span>
              <TimePickerUnit value={timeLimit.s} label="초" onChange={(v) => setTimeLimit(prev => ({ ...prev, s: v }))} max={59} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-gray-900">관심 주제</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedTopics.includes(topic)
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'bg-white border border-gray-100 text-gray-500'
                  }`}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full py-5 bg-orange-500 text-white rounded-[32px] font-black shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
        >
          채팅방 개설하기
        </button>
      </motion.div>
    </motion.div>
  );
}

function TimePickerUnit({ value, label, max, onChange }: { value: number; label: string; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 ? '' : value.toString()}
        placeholder="0"
        onChange={(e) => {
          let val = e.target.value.replace(/[^0-9]/g, '');
          if (val.length > 2) {
            val = val.slice(-2);
          }
          const n = val === '' ? 0 : parseInt(val, 10);
          onChange(Math.min(max, n));
        }}
        onBlur={() => {
          if (value === undefined || isNaN(value)) onChange(0);
        }}
        className="w-16 h-16 bg-white border-2 border-transparent focus:border-orange-500 rounded-2xl text-center font-black text-xl outline-none transition-all shadow-sm"
      />
      <span className="text-[10px] font-black text-gray-400 uppercase">{label}</span>
    </div>
  );
}

function ChatRoomView({ room, onClose }: { room: ChatRoom; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'user3', text: '안녕하세요! 반갑습니다.', timestamp: new Date(), type: 'text' },
    { id: '2', senderId: 'me', text: '네, 안녕하세요! 영화 좋아하시나요?', timestamp: new Date(), type: 'text' },
  ]);
  const [input, setInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState(65); // 1m 5s for demo
  const [activeRecommendation, setActiveRecommendation] = useState<string | null>(null);
  const recommendedTopics = ['오늘의 날씨', '최근 본 영화', '좋아하는 음악', '식사하셨어요?', '최근의 고민', '가고 싶은 여행지'];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: input,
      timestamp: new Date(),
      type: 'text',
      overtime: timeLeft < 0 ? Math.abs(timeLeft) : undefined
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  const handleRecommendTopic = () => {
    const randomTopic = recommendedTopics[Math.floor(Math.random() * recommendedTopics.length)];
    setActiveRecommendation(randomTopic);
    setShowAttachMenu(false);
    
    // Hide popup after 3 seconds
    setTimeout(() => {
      setActiveRecommendation(null);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed inset-0 z-[110] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-400">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <div>
            <h3 className="font-black text-gray-900 leading-none">{room.title}</h3>
            <div className="flex gap-1 mt-1">
              {room.topics.map(t => <span key={t} className="text-[10px] font-bold text-gray-400">#{t}</span>)}
            </div>
          </div>
        </div>
        
        {/* Timer */}
        <AnimatePresence>
          {timeLeft <= 60 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-red-100"
            >
              <Clock size={14} className="text-red-500 animate-pulse" />
              <span className="text-xs font-black text-red-500 font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 relative">
        <AnimatePresence>
          {activeRecommendation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex justify-center"
            >
              <div className={`
                ${activeRecommendation === '식사하셨어요?' ? 'bg-orange-500 text-white' : 'bg-white text-gray-900 border-4 border-orange-500'} 
                w-full max-w-[260px] p-8 rounded-[40px] shadow-2xl text-center space-y-4 backdrop-blur-sm
              `}>
                <div className={`w-12 h-12 ${activeRecommendation === '식사하셨어요?' ? 'bg-white/20' : 'bg-orange-50'} rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                  <BrainCircuit size={24} className={activeRecommendation === '식사하셨어요?' ? 'text-white' : 'text-orange-500'} />
                </div>
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${activeRecommendation === '식사하셨어요?' ? 'opacity-80' : 'text-orange-500'}`}>추천 대화 주제</h4>
                <p className="text-xl font-black leading-tight">{activeRecommendation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
              msg.senderId === 'me' 
                ? 'bg-orange-500 text-white rounded-br-none' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
            }`}>
              {msg.text}
            </div>
            {msg.overtime && (
              <span className="text-[10px] font-black text-red-400 mb-1">
                +{msg.overtime}초 초과
              </span>
            )}
            <span className="text-[9px] font-bold text-gray-300 mb-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`p-3 rounded-2xl transition-all ${showAttachMenu ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              <Plus size={24} />
            </button>
            
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: -10, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="absolute bottom-full left-0 mb-4 bg-white border border-gray-100 p-4 rounded-[32px] shadow-2xl w-64 space-y-4"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-all">
                      <Paperclip size={20} />
                      <span className="text-[10px] font-black">파일</span>
                    </button>
                    <button className="p-4 bg-gray-50 rounded-2xl flex flex-col items-center gap-2 text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-all">
                      <MessageSquare size={20} />
                      <span className="text-[10px] font-black">사진</span>
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">대화 지원</h4>
                    <button
                      onClick={handleRecommendTopic}
                      className="w-full p-4 bg-orange-500 text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
                    >
                      <BrainCircuit size={20} />
                      <span className="text-sm font-black">대화 주제 추천받기</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              className="w-full pl-6 pr-14 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-medium transition-all"
            />
            <button
              onClick={handleSendMessage}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                input.trim() ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : 'bg-gray-200 text-white'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
