import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import ProfileIcon from './ProfileIcon';
import { acceptFriendRequest, rejectFriendRequest, cancelFriendRequest } from '../lib/friend-utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import type { FriendRequest } from '../types';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const qIn = query(
      collection(db, 'friendRequests'),
      where('toId', '==', user.uid),
      where('status', '==', 'pending'),
    );
    const unsubIn = onSnapshot(
      qIn,
      (snap) => setIncoming(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FriendRequest))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'friendRequests (in)', user),
    );
    const qOut = query(
      collection(db, 'friendRequests'),
      where('fromId', '==', user.uid),
      where('status', '==', 'pending'),
    );
    const unsubOut = onSnapshot(
      qOut,
      (snap) => setOutgoing(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FriendRequest))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'friendRequests (out)', user),
    );
    return () => {
      unsubIn();
      unsubOut();
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleAccept = async (req: FriendRequest) => {
    try {
      await acceptFriendRequest(req);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `friendRequests/${req.id}`, user);
    }
  };
  const handleReject = async (id: string) => {
    try {
      await rejectFriendRequest(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendRequests/${id}`, user);
    }
  };
  const handleCancel = async (id: string) => {
    try {
      await cancelFriendRequest(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendRequests/${id}`, user);
    }
  };

  const total = incoming.length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 transition-all"
      >
        <Bell size={18} className="text-gray-500" />
        {total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {total}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-3 w-[340px] bg-white border border-gray-100 rounded-[28px] shadow-2xl z-50 overflow-hidden"
          >
            {/* bubble arrow */}
            <div className="absolute -top-2 right-5 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

            <div className="p-2 bg-gray-50 flex gap-1">
              <button
                onClick={() => setTab('incoming')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  tab === 'incoming' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'
                }`}
              >
                요청중 {incoming.length > 0 && `(${incoming.length})`}
              </button>
              <button
                onClick={() => setTab('outgoing')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                  tab === 'outgoing' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400'
                }`}
              >
                신청중 {outgoing.length > 0 && `(${outgoing.length})`}
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-3 space-y-2">
              {tab === 'incoming' ? (
                incoming.length === 0 ? (
                  <p className="text-center text-xs font-bold text-gray-300 py-8">받은 신청이 없습니다</p>
                ) : (
                  incoming.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                    >
                      <ProfileIcon
                        photoURL={r.fromPhoto}
                        profileIcon={r.fromIcon}
                        nickname={r.fromName}
                        size={40}
                      />
                      <p className="flex-1 text-xs font-black text-gray-900 truncate">
                        {r.fromName}
                      </p>
                      <button
                        onClick={() => handleAccept(r)}
                        className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="p-2 bg-gray-200 text-gray-500 rounded-xl hover:bg-gray-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )
              ) : outgoing.length === 0 ? (
                <p className="text-center text-xs font-bold text-gray-300 py-8">보낸 신청이 없습니다</p>
              ) : (
                outgoing.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <ProfileIcon
                      photoURL={r.toPhoto}
                      profileIcon={r.toIcon}
                      nickname={r.toName}
                      size={40}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 truncate">{r.toName || r.toId}</p>
                      <p className="text-[10px] font-bold text-gray-400">응답 대기 중</p>
                    </div>
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="px-3 py-2 bg-white border border-gray-200 text-gray-500 rounded-xl text-[10px] font-black hover:bg-gray-100"
                    >
                      취소
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
