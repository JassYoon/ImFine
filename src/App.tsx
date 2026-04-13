import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { setDoc, updateDoc, doc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from './firebase';
import type { UserProfile } from './types';
import Layout from './components/Layout';
import Logo from './components/Logo';
import Home from './views/Home';
import TextChat from './views/TextChat';
import VoiceChat from './views/VoiceChat';
import Practice from './views/Practice';
import MyPage from './views/MyPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// Firebase Context
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

// App Component
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showPrePermission, setShowPrePermission] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            // First login: copy Google profile as starting point.
            await setDoc(ref, {
              uid: user.uid,
              displayName: user.displayName ?? '',
              photoURL: user.photoURL ?? '',
              email: user.email ?? '',
              role: 'user',
              lastLogin: serverTimestamp(),
            });
          } else {
            // Subsequent login: only touch lastLogin, do not overwrite user edits.
            await updateDoc(ref, { lastLogin: serverTimestamp() });
          }
        } catch (error) {
          console.error('Error initializing user profile:', error);
        }
      } else {
        setProfile(null);
      }
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      setProfile(snap.exists() ? ({ uid: user.uid, ...(snap.data() as any) } as UserProfile) : null);
    });
    return () => unsub();
  }, [user]);

  const requestPermissions = async () => {
    setShowPrePermission(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Permission denied:', err);
      setPermissionDenied(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <Logo className="w-24 h-24" />
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-black text-orange-500 tracking-tighter">식사하셨어요?</h1>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-[0.3em]">ImFine</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="flex flex-col items-center gap-8 text-center max-w-sm">
          <div className="w-24 h-24 bg-orange-50 rounded-[40px] flex items-center justify-center rotate-12">
            <Logo className="w-14 h-14" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">
              반가워요!<br/>로그인이 필요해요
            </h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              '식사하셨어요?'는 구글 로그인을 통해 안전하게 대화를 나눌 수 있습니다.
            </p>
          </div>
          <button 
            onClick={signInWithGoogle}
            className="w-full py-5 bg-white border-2 border-gray-100 text-gray-900 font-black rounded-3xl shadow-sm hover:border-orange-500 transition-all flex items-center justify-center gap-3"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Google로 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (showPrePermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="flex flex-col items-center gap-8 text-center max-w-sm">
          <div className="w-24 h-24 bg-orange-50 rounded-[40px] flex items-center justify-center rotate-12">
            <Logo className="w-14 h-14" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-tight">
              더 나은 대화를 위해<br/>권한이 필요해요
            </h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              '식사하셨어요?'는 보이스챗과 연습하기 기능을 위해 카메라와 마이크 권한을 사용합니다.
            </p>
          </div>
          <div className="w-full space-y-3">
            <button 
              onClick={requestPermissions}
              className="w-full py-5 bg-orange-500 text-white font-black rounded-3xl shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
            >
              허용하고 시작하기
            </button>
            <p className="text-[10px] text-gray-400 font-bold">
              권한을 거부하시면 앱 사용이 제한될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <Logo className="w-12 h-12 opacity-50 grayscale" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">권한이 필요합니다</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              원활한 대화 연습을 위해 카메라와 마이크 권한이 필요합니다.<br/>
              설정에서 권한을 허용하신 후 다시 접속해 주세요.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <ErrorBoundary>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/friends" element={<Navigate to="/" replace />} />
              <Route path="/text-chat" element={<TextChat />} />
              <Route path="/voice-chat" element={<VoiceChat />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/mypage" element={<MyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}
