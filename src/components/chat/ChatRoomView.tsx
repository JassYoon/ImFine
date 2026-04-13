import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ChevronRight, Paperclip, Send, BrainCircuit, Clock, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, limit, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../App';
import { ChatRoom, Message, TESTER_UID } from '../../types';
import type { FriendCardData } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-utils';
import ProfileIcon from '../ProfileIcon';
import ProfileModal from '../ProfileModal';

interface ChatRoomViewProps {
  room: ChatRoom;
  onClose: () => void;
}

const ChatRoomView: React.FC<ChatRoomViewProps> = ({ room, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [partner, setPartner] = useState<FriendCardData | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [myFriends, setMyFriends] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState(room.timeLimit || 3600);
  const [activeRecommendation, setActiveRecommendation] = useState<string | null>(null);
  const recommendedTopics = ['오늘의 날씨', '최근 본 영화', '좋아하는 음악', '식사하셨어요?', '최근의 고민', '가고 싶은 여행지'];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const me = await getDoc(doc(db, 'users', user.uid));
      setMyFriends((me.exists() && (me.data() as any).friends) || []);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const partnerId = room.participants?.find((p) => p !== user.uid) || TESTER_UID;
    (async () => {
      const snap = await getDoc(doc(db, 'users', partnerId));
      if (snap.exists()) {
        const d = snap.data() as any;
        setPartner({
          uid: partnerId,
          nickname: d.nickname || d.displayName || partnerId,
          photoURL: d.photoURL,
          profileIcon: d.profileIcon,
        });
      } else {
        setPartner({ uid: partnerId, nickname: partnerId === TESTER_UID ? 'tester' : partnerId, profileIcon: partnerId === TESTER_UID ? 'yellow' : undefined });
      }
    })();
  }, [room.id, room.participants, user]);

  useEffect(() => {
    if (!room.id) return;
    const q = query(
      collection(db, 'chatRooms', room.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chatRooms/${room.id}/messages`, user));
    return () => unsubscribe();
  }, [room.id, user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;
    
    const text = input;
    setInput('');
    
    try {
      await addDoc(collection(db, 'chatRooms', room.id, 'messages'), {
        senderId: user.uid,
        text: text,
        timestamp: serverTimestamp(),
        type: 'text',
        overtime: timeLeft < 0 ? Math.abs(timeLeft) : null
      });
      
      await updateDoc(doc(db, 'chatRooms', room.id), {
        lastMessageAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chatRooms/${room.id}/messages`, user);
    }
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

        {messages.map((msg, idx) => {
          const isMine = msg.senderId === user?.uid;
          const prev = messages[idx - 1];
          const showPartnerHeader = !isMine && (!prev || prev.senderId !== msg.senderId);
          return (
          <div key={msg.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
            {!isMine && (
              showPartnerHeader && partner ? (
                <div className="flex flex-col items-center gap-1">
                  <ProfileIcon
                    photoURL={partner.photoURL}
                    profileIcon={partner.profileIcon}
                    nickname={partner.nickname}
                    size={32}
                    onClick={() => setShowProfile(true)}
                  />
                  <span className="text-[9px] font-black text-gray-500 max-w-[48px] truncate">{partner.nickname}</span>
                </div>
              ) : (
                <div className="w-8 flex-shrink-0" />
              )
            )}
            <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
              isMine
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
              {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
            </span>
          </div>
          );
        })}
        <div ref={messagesEndRef} />
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

      <AnimatePresence>
        {showProfile && partner && (
          <ProfileModal
            target={partner}
            myFriends={myFriends}
            onClose={() => setShowProfile(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatRoomView;
