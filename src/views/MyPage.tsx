import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Save, ArrowLeft, Camera, LogOut, Mail, Beaker } from 'lucide-react';
import { db, logout } from '../firebase';
import { useAuth } from '../App';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { seedTestFriendRequests } from '../lib/devtools';
import ProfileIcon from '../components/ProfileIcon';

const MAX_IMAGE_BYTES = 700 * 1024; // 700KB — Firestore field limit is 1MB

export default function MyPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [photoURL, setPhotoURL] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Sync from live profile snapshot
  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname || profile.displayName || '');
    setPhotoURL(profile.photoURL);
  }, [profile]);

  const dirty =
    profile != null &&
    (nickname !== (profile.nickname || profile.displayName || '') || photoURL !== profile.photoURL);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택할 수 있습니다.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert(`파일이 너무 큽니다. ${Math.round(MAX_IMAGE_BYTES / 1024)}KB 이하의 이미지를 선택하세요.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoURL(reader.result as string);
    reader.onerror = () => alert('파일을 읽지 못했습니다.');
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nickname: nickname.trim(),
        displayName: nickname.trim(),
        photoURL: photoURL ?? '',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`, user);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      // onAuthStateChanged in App.tsx flips state back to loading/login screen.
    } catch (error) {
      console.error('Logout failed:', error);
      setSigningOut(false);
    }
  };

  const handleSeedTestData = async () => {
    if (!user) return;
    setSeeding(true);
    try {
      await seedTestFriendRequests({
        uid: user.uid,
        name: nickname || user.email || '나',
        photo: photoURL,
      });
      alert('테스트 친구 신청이 생성되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'friendRequests (seed)', user);
      alert('테스트 데이터 생성 실패');
    } finally {
      setSeeding(false);
    }
  };

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

      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <ProfileIcon
              photoURL={photoURL}
              profileIcon={profile?.profileIcon}
              nickname={nickname}
              size={128}
            />
            <button
              onClick={handlePickFile}
              title="사진 변경"
              className="absolute bottom-0 right-0 p-2.5 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 active:scale-95 transition-all"
            >
              <Camera size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {photoURL && (
            <button
              onClick={() => setPhotoURL(undefined)}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              기본 아이콘으로 되돌리기
            </button>
          )}
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <label className="block text-sm font-black text-gray-700">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={40}
            placeholder="닉네임을 입력하세요"
            className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !dirty || nickname.trim().length === 0}
          className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Save size={20} />
          {saving ? '저장 중...' : dirty ? '변경사항 저장' : '변경사항 없음'}
        </button>
      </div>

      {/* Account */}
      <div className="mt-6 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">계정</h2>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
          <Mail size={18} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm font-bold text-gray-800 truncate">{user?.email ?? '—'}</span>
        </div>
        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="w-full py-3.5 bg-gray-50 border border-gray-100 text-gray-700 rounded-2xl font-black text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <LogOut size={18} />
          {signingOut ? '로그아웃 중...' : '로그아웃'}
        </button>
      </div>

      {/* Dev Tools (removed at deploy time) */}
      <div className="mt-12 p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
        <div className="flex items-center gap-2 mb-4 text-gray-500">
          <Beaker size={20} />
          <h2 className="font-bold uppercase tracking-wider text-xs">Development Tools</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          테스트 친구 신청 생성:
          <br />• 받은 신청: A(흰색), B(파랑), C(분홍)
          <br />• 보낸 신청: D(초록)
        </p>
        <button
          onClick={handleSeedTestData}
          disabled={seeding}
          className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Beaker size={18} />
          {seeding ? '생성 중...' : 'Create Test Data'}
        </button>
      </div>
    </motion.div>
  );
}
