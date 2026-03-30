import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { User, Camera, Save, ChevronLeft, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setNickname(userDoc.data().displayName || '');
        }
        setLoading(false);
      };
      fetchProfile();
    }
    // Check if dev environment
    setIsDev(window.location.hostname.includes('ais-dev') || window.location.hostname.includes('localhost'));
  }, [user]);

  const handleSave = async () => {
    if (!user || !nickname.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: nickname.trim(),
      });
      alert('프로필이 저장되었습니다.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const seedTestData = async () => {
    if (!user) return;
    try {
      // 1. Create a test chat room
      await addDoc(collection(db, 'chatRooms'), {
        title: '[테스트] 친구 신청 기능 테스트용 방',
        creatorId: 'test-system',
        participants: ['test-system'],
        status: 'waiting',
        topics: ['테스트', '친구신청'],
        timeLimit: 600,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });

      // 2. Create 3 friend requests
      const testUsers = [
        { id: 'test-user-1', name: '김철수', photo: 'https://picsum.photos/seed/chulsoo/100/100' },
        { id: 'test-user-2', name: '이영희', photo: 'https://picsum.photos/seed/younghee/100/100' },
        { id: 'test-user-3', name: '박지민', photo: 'https://picsum.photos/seed/jimin/100/100' },
      ];

      for (const tUser of testUsers) {
        await addDoc(collection(db, 'friendRequests'), {
          fromId: tUser.id,
          fromName: tUser.name,
          fromPhoto: tUser.photo,
          toId: user.uid,
          status: 'pending',
          createdAt: serverTimestamp(),
        });
      }

      alert('테스트 데이터가 생성되었습니다.');
    } catch (error) {
      console.error('Error seeding test data:', error);
      alert('데이터 생성 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-400">로딩 중...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200 transition-all">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter">마이페이지</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 bg-orange-50 rounded-[32px] flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={40} className="text-orange-500" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-white border border-gray-100 rounded-xl shadow-md text-gray-400 hover:text-orange-500 transition-all">
              <Camera size={16} />
            </button>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-900 ml-2">닉네임</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-5 bg-orange-500 text-white rounded-[32px] font-black shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            <span>{saving ? '저장 중...' : '프로필 저장하기'}</span>
          </button>
        </div>
      </div>

      {isDev && (
        <div className="bg-red-50 border border-red-100 rounded-[32px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <Database size={20} />
            <h4 className="font-black text-sm">개발자 도구</h4>
          </div>
          <p className="text-xs font-medium text-red-500 leading-relaxed">
            개발 서버 전용 테스트 데이터를 생성합니다. (채팅방 1개, 친구 신청 3개)
          </p>
          <button
            onClick={seedTestData}
            className="w-full py-4 bg-white border border-red-200 text-red-600 font-black rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            테스트 데이터 생성하기
          </button>
        </div>
      )}

      <button
        onClick={() => auth.signOut()}
        className="w-full py-4 text-gray-400 font-bold hover:text-red-500 transition-all"
      >
        로그아웃
      </button>
    </motion.div>
  );
}
