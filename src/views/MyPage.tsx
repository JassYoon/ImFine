import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { User, Camera, Save, ArrowLeft, Beaker } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { createTestChatRooms, createTestFriendRequests } from '../lib/devtools';

export default function MyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingTestData, setGeneratingTestData] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || '');
          setPhotoURL(data.photoURL || '');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`, user);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        photoURL,
        updatedAt: serverTimestamp(),
      });
      alert('프로필이 저장되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`, user);
    } finally {
      setSaving(false);
    }
  };

  const generateTestData = async () => {
    if (!user) return;
    setGeneratingTestData(true);
    try {
      // Create 4 test chat rooms
      await createTestChatRooms();
      
      // Create 3 friend requests
      await createTestFriendRequests(user.uid);

      alert(`✅ 테스트 데이터가 생성되었습니다!

📌 생성된 데이터:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 채팅방 4개:
  ⏱️ 5초 시간 제한
  ⏱️ 30분 시간 제한
  ⏱️ 5시간 시간 제한
  ⏱️ 무제한 시간 제한

👥 친구 신청 3개:
  🔴 친구A
  🟢 친구B
  🔵 친구C

💡 테스트 방법:
1️⃣ 홈(친구) 탭 → 친구 신청 확인
2️⃣ "문자로" 탭 → "추천 채팅방"에서 테스트 방 확인
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    } catch (error) {
      console.error('Error generating test data:', error);
      alert('테스트 데이터 생성 실패');
      handleFirestoreError(error, OperationType.WRITE, 'test-data', user);
    } finally {
      setGeneratingTestData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-gray-900">마이페이지</h1>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-md">
              {photoURL ? (
                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User size={48} />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-colors">
              <Camera size={20} />
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium">{user?.email}</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">닉네임</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              placeholder="닉네임을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">프로필 이미지 URL</label>
            <input
              type="text"
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              placeholder="이미지 URL을 입력하세요"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {saving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>

      {/* Dev Tools Section */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mt-12 p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
          <div className="flex items-center gap-2 mb-4 text-gray-500">
            <Beaker size={20} />
            <h2 className="font-bold uppercase tracking-wider text-xs">Development Tools</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            한 번의 클릭으로 테스트 환경을 구성합니다:
            <br />• 채팅방 4개 (5초, 30분, 5시간, 무제한)
            <br />• 친구 신청 3개 (A🔴, B🟢, C🔵)
          </p>
          <button
            onClick={generateTestData}
            disabled={generatingTestData}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Beaker size={18} />
            {generatingTestData ? '생성 중...' : 'Create Test Data'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
    </motion.div>
  );
}
