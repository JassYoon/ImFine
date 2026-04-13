import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import ProfileIcon from './ProfileIcon';
import { useAuth } from '../App';
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from '../lib/friend-utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import type { FriendCardData, FriendRequest } from '../types';

interface ProfileModalProps {
  target: FriendCardData;
  myFriends: string[];
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ target, myFriends, onClose }) => {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [incomingReq, setIncomingReq] = useState<FriendRequest | null>(null);
  const isSelf = user?.uid === target.uid;
  const isFriend = myFriends.includes(target.uid);

  useEffect(() => {
    if (!user || isSelf) return;
    const q = query(
      collection(db, 'friendRequests'),
      where('fromId', '==', target.uid),
      where('toId', '==', user.uid),
      where('status', '==', 'pending'),
    );
    const unsub = onSnapshot(q, (snap) => {
      const first = snap.docs[0];
      setIncomingReq(first ? ({ id: first.id, ...first.data() } as FriendRequest) : null);
    });
    return () => unsub();
  }, [user, target.uid, isSelf]);

  const handleSend = async () => {
    if (!user) return;
    setSending(true);
    try {
      await sendFriendRequest(
        {
          uid: user.uid,
          name: user.displayName || user.email || '익명',
          photo: user.photoURL || undefined,
        },
        { uid: target.uid, name: target.nickname, photo: target.photoURL, icon: target.profileIcon },
      );
      setSent(true);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('이미') || error.message.includes('본인'))) {
        alert(error.message);
      } else {
        handleFirestoreError(error, OperationType.CREATE, 'friendRequests', user);
      }
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    if (!incomingReq) return;
    try {
      await acceptFriendRequest(incomingReq);
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `friendRequests/${incomingReq.id}`, user);
    }
  };

  const handleReject = async () => {
    if (!incomingReq) return;
    try {
      await rejectFriendRequest(incomingReq.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `friendRequests/${incomingReq.id}`, user);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm rounded-[40px] p-8 flex flex-col items-center gap-5 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>

        <ProfileIcon
          photoURL={target.photoURL}
          profileIcon={target.profileIcon}
          nickname={target.nickname}
          size={128}
        />

        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">{target.nickname}</h3>
        </div>

        {!isSelf && (
          isFriend ? (
            <div className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-sm text-center">
              이미 친구입니다
            </div>
          ) : incomingReq ? (
            <div className="w-full flex gap-2">
              <button
                onClick={handleAccept}
                className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} /> 친구 승인
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-sm hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <X size={18} /> 친구 거절
              </button>
            </div>
          ) : sent ? (
            <div className="w-full py-4 bg-green-50 text-green-500 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
              <Check size={18} /> 친구 신청 완료
            </div>
          ) : (
            <button
              onClick={handleSend}
              disabled={sending}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus size={18} />
              {sending ? '신청 중...' : '친구 추가'}
            </button>
          )
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProfileModal;
