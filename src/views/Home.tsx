import { useState, useEffect } from 'react';
import { Users, MessageSquare, Mic, BrainCircuit, Check, X, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function Home() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/notifications`;
    const q = query(collection(db, path));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, path, user));
    return () => unsubscribe();
  }, [user]);

  const handleAccept = async (notif: any) => {
    if (!user) return;
    const path = `users/${user.uid}/notifications/${notif.id}`;
    try {
      // In a real app, we'd add to a 'friends' collection
      // For this test, we'll just delete the notification
      await deleteDoc(doc(db, path));
      alert(`${notif.fromName}님의 친구 신청을 수락했습니다.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path, user);
    }
  };

  const handleReject = async (notif: any) => {
    if (!user) return;
    const path = `users/${user.uid}/notifications/${notif.id}`;
    try {
      await deleteDoc(doc(db, path));
      alert(`${notif.fromName}님의 친구 신청을 거절했습니다.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path, user);
    }
  };

  return (
    <div className="space-y-12">
      {/* Notifications Section (Friend Requests) */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-2">
              <Bell size={18} className="text-orange-500" />
              <h2 className="text-lg font-black text-gray-900">새로운 알림</h2>
            </div>
            <div className="grid gap-3">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  layout
                  className="bg-white border border-orange-100 p-4 rounded-3xl shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 font-bold">
                      {notif.fromName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{notif.fromName}님이 친구 신청을 보냈습니다.</p>
                      <p className="text-[10px] font-bold text-gray-400">방금 전</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(notif)}
                      className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(notif)}
                      className="p-2 bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Web: Cards for other sections (Now on Top) */}
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

      {/* Web: Friends List (Now on Bottom) */}
      <section className="hidden md:block space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">친구 목록</h2>
          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
            0명
          </span>
        </div>
        <div className="bg-white border-2 border-dashed border-gray-100 p-12 rounded-[32px] text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Users className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-400 font-bold">아직 친구가 없습니다.<br/>대화 연습을 시작할 친구를 찾아보세요!</p>
        </div>
      </section>

      {/* Mobile: Default View (Friends List) */}
      <section className="md:hidden space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">친구</h2>
          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
            0명
          </span>
        </div>
        <div className="bg-white border-2 border-dashed border-gray-100 p-12 rounded-[32px] text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Users className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-400 font-bold">아직 친구가 없습니다.<br/>대화 연습을 시작할 친구를 찾아보세요!</p>
        </div>
      </section>
    </div>
  );
}
