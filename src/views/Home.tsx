import { useState, useEffect, useMemo } from 'react';
import { Users, MessageSquare, Mic, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  doc,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { useAuth } from '../App';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { fetchUserCards, removeFriend } from '../lib/friend-utils';
import NotificationBell from '../components/NotificationBell';
import FriendCard from '../components/FriendCard';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import ChatRoomView from '../components/chat/ChatRoomView';
import type { FriendCardData, ChatRoom } from '../types';

export default function Home() {
  const { user } = useAuth();
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendCardData[]>([]);
  const [pendingChatFriend, setPendingChatFriend] = useState<FriendCardData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [waitingRooms, setWaitingRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data() as any;
        setFriendIds(data?.friends || []);
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`, user),
    );
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }
    fetchUserCards(friendIds).then(setFriends);
  }, [friendIds]);

  // Subscribe to all chatRooms where I'm a participant and status is 'waiting'
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      where('status', '==', 'waiting'),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatRoom));
        setWaitingRooms(rooms);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'chatRooms (waiting/me)', user),
    );
    return () => unsub();
  }, [user]);

  // Map friendUid -> { room, direction }
  const pendingByFriend = useMemo(() => {
    const m = new Map<string, { room: ChatRoom; direction: 'incoming' | 'outgoing' }>();
    if (!user) return m;
    for (const r of waitingRooms) {
      const other = r.participants?.find((p) => p !== user.uid);
      if (!other) continue;
      const direction = r.creatorId === user.uid ? 'outgoing' : 'incoming';
      // keep the earliest one per friend
      if (!m.has(other)) m.set(other, { room: r, direction });
    }
    return m;
  }, [waitingRooms, user]);

  const handleRemoveFriend = async (friend: FriendCardData) => {
    if (!user) return;
    if (!window.confirm(`${friend.nickname}님을 친구에서 삭제하시겠습니까?`)) return;
    try {
      await removeFriend(user.uid, friend.uid);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/friends', user);
    }
  };

  const handleCreateChat = async (roomData: Partial<ChatRoom>) => {
    if (!user || !pendingChatFriend) return;
    try {
      await addDoc(collection(db, 'chatRooms'), {
        ...roomData,
        creatorId: user.uid,
        participants: [user.uid, pendingChatFriend.uid],
        status: 'waiting',
        kind: 'direct',
        invitedUid: pendingChatFriend.uid,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
      setPendingChatFriend(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'chatRooms', user);
    }
  };

  const handleEnterRoom = async (room: ChatRoom) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'chatRooms', room.id), {
        status: 'active',
        lastMessageAt: serverTimestamp(),
      });
      setSelectedRoom({ ...room, participants: room.participants });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chatRooms/${room.id}`, user);
    }
  };

  const handleCancelInvite = async (room: ChatRoom) => {
    if (!user) return;
    if (!window.confirm('보낸 채팅방 초대를 취소하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'chatRooms', room.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `chatRooms/${room.id}`, user);
    }
  };

  return (
    <div className="space-y-12">
      {/* Web: Cards for other sections (Top) */}
      <section className="hidden md:grid grid-cols-3 gap-6">
        <Link to="/text-chat" className="group bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:border-orange-200 transition-all">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MessageSquare className="text-orange-500" size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">문자로</h3>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">천천히 대화에<br/>익숙해져 보아요</p>
        </Link>
        <Link to="/voice-chat" className="group bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:border-yellow-200 transition-all">
          <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Mic className="text-yellow-500" size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">소리로</h3>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">끊기지 않게 대화를<br/>이어가 보아요</p>
        </Link>
        <Link to="/practice" className="group bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:border-orange-300 transition-all">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BrainCircuit className="text-orange-600" size={28} />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">연습하기</h3>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">부담 없는 환경에서<br/>자신감을 키워보아요</p>
        </Link>
      </section>

      {/* Friend List Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-900">친구 목록</h2>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
              {friends.length}명
            </span>
          </div>
          <NotificationBell />
        </div>

        {friends.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 p-12 rounded-[32px] text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Users className="text-gray-300" size={32} />
            </div>
            <p className="text-gray-400 font-bold">
              아직 친구가 없습니다.<br/>대화 연습을 시작할 친구를 찾아보세요!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {friends.map((f) => {
              const pending = pendingByFriend.get(f.uid);
              return (
                <FriendCard
                  key={f.uid}
                  friend={f}
                  pendingRoom={pending?.room ?? null}
                  pendingDirection={pending?.direction ?? null}
                  onCreateChat={setPendingChatFriend}
                  onEnterRoom={handleEnterRoom}
                  onCancelInvite={handleCancelInvite}
                  onRemove={handleRemoveFriend}
                />
              );
            })}
          </div>
        )}
      </section>

      <AnimatePresence>
        {pendingChatFriend && (
          <CreateRoomModal
            onClose={() => setPendingChatFriend(null)}
            onCreate={handleCreateChat}
          />
        )}
        {selectedRoom && (
          <ChatRoomView room={selectedRoom} onClose={() => setSelectedRoom(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
