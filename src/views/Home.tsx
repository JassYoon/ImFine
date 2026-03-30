import { Users, MessageSquare, Mic, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-12">
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
