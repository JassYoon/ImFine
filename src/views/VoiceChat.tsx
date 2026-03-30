import { Mic, Video, Plus } from 'lucide-react';
import { useState } from 'react';

export default function VoiceChat() {
  const [isConnecting, setIsConnecting] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
            <Mic className="text-yellow-500" size={24} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">소리로</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Create Button */}
        <button
          onClick={() => setIsConnecting(true)}
          className="w-full py-6 bg-yellow-400 text-white rounded-[32px] font-black flex flex-col items-center justify-center gap-2 shadow-lg shadow-yellow-100 hover:bg-yellow-500 transition-all active:scale-95"
        >
          <div className="flex items-center gap-3">
            <Plus size={24} />
            <span className="text-lg">새로운 보이스챗 시작하기</span>
          </div>
          <span className="text-[10px] opacity-80">카메라와 마이크가 활성화됩니다</span>
        </button>

        <div className="bg-white border border-gray-100 p-12 rounded-[40px] text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <Video className="text-gray-200" size={32} />
          </div>
          <p className="text-gray-400 font-bold">진행 중인 보이스챗이 없습니다.<br/>친구와 목소리로 대화해보세요!</p>
        </div>
      </div>

      {/* Placeholder for connecting state */}
      {isConnecting && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 bg-yellow-400/20 rounded-full animate-ping absolute inset-0" />
            <div className="w-32 h-32 bg-yellow-400 rounded-[48px] flex items-center justify-center relative">
              <Mic className="text-white" size={48} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tighter">카메라와 마이크를 켜는 중...</h2>
            <p className="text-yellow-200/60 font-medium">잠시만 기다려 주세요</p>
          </div>
          <button 
            onClick={() => setIsConnecting(false)}
            className="px-8 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all"
          >
            취소하기
          </button>
        </div>
      )}
    </div>
  );
}
