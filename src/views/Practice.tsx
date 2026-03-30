import { BrainCircuit } from 'lucide-react';

export default function Practice() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
          <BrainCircuit className="text-orange-600" size={24} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter">연습하기</h2>
      </div>
      <div className="bg-white border border-gray-100 p-12 rounded-[40px] text-center space-y-4 shadow-sm">
        <p className="text-gray-400 font-bold">AI와 함께하는 대화 연습을 시작해보세요.<br/>단계별로 대화 실력을 키울 수 있습니다.</p>
      </div>
    </div>
  );
}
