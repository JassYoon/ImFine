import React, { useState, useEffect } from 'react';
import { Plus, Clock, Hash, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { COMMON_TOPICS, TIME_RANGES, ChatRoom } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import RoomCard from '../components/chat/RoomCard';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import ChatRoomView from '../components/chat/ChatRoomView';

export default function TextChat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'search'>('my');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string | null>(null);
  const [selectedSearchTopics, setSelectedSearchTopics] = useState<string[]>([]);
  
  const [waitingRooms, setWaitingRooms] = useState<ChatRoom[]>([]);
  const [myRooms, setMyRooms] = useState<ChatRoom[]>([]);
  const [searchRooms, setSearchRooms] = useState<ChatRoom[]>([]);

  // Listen for my rooms
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      where('status', '==', 'active')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      setMyRooms(rooms);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chatRooms (my)', user));
    return () => unsubscribe();
  }, [user]);

  // Listen for waiting rooms (my own waiting rooms)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('creatorId', '==', user.uid),
      where('status', '==', 'waiting')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom))
        .filter(room => (room as any).kind !== 'direct');
      setWaitingRooms(rooms);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chatRooms (waiting)', user));
    return () => unsubscribe();
  }, [user]);

  // Listen for search rooms (others' waiting rooms)
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('status', '==', 'waiting')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom))
        .filter(room => room.creatorId !== user.uid && (room as any).kind !== 'direct');
      setSearchRooms(rooms);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chatRooms (search)', user));
    return () => unsubscribe();
  }, [user]);

  const handleCreateRoom = async (roomData: Partial<ChatRoom>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'chatRooms'), {
        ...roomData,
        creatorId: user.uid,
        participants: [user.uid],
        status: 'waiting',
        kind: 'open',
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
      setIsCreating(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chatRooms', user);
    }
  };

  const handleJoinRoom = async (room: ChatRoom) => {
    if (!user) return;
    try {
      const roomRef = doc(db, 'chatRooms', room.id);
      await updateDoc(roomRef, {
        participants: arrayUnion(user.uid),
        status: 'active',
        lastMessageAt: serverTimestamp()
      });
      setSelectedRoom(room);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chatRooms/${room.id}`, user);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!user) return;
    if (!window.confirm('채팅방을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'chatRooms', roomId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `chatRooms/${roomId}`, user);
    }
  };

  const handleAddCustomTopic = () => {
    if (customTopic.trim()) {
      setSelectedSearchTopics(prev => [...prev, customTopic.trim()]);
      setCustomTopic('');
      setIsAddingCustom(false);
    }
  };

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
                .sort((a, b) => {
                  const timeA = a.lastMessageAt?.toMillis?.() || 0;
                  const timeB = b.lastMessageAt?.toMillis?.() || 0;
                  return timeB - timeA;
                })
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
                    <div key={room.id} className="min-w-[280px] snap-center bg-white border border-orange-100 p-5 rounded-[32px] shadow-sm space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                          <Clock size={20} className="text-orange-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-gray-400">대기 중...</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRoom(room.id);
                            }}
                            className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                            title="삭제"
                          >
                            <X size={14} />
                          </button>
                        </div>
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
              {searchRooms.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">검색 결과가 없습니다.</p>
              ) : (
                searchRooms.map(room => (
                  <RoomCard key={room.id} room={room} onClick={() => handleJoinRoom(room)} />
                ))
              )}
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

