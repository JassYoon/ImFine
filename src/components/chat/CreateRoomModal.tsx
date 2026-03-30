import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { COMMON_TOPICS, ChatRoom } from '../../types';

interface CreateRoomModalProps {
  onClose: () => void;
  onCreate: (room: Partial<ChatRoom>) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState<{ h: number; m: number; s: number }>({ h: 0, m: 10, s: 0 });

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    const totalSeconds = timeLimit.h * 3600 + timeLimit.m * 60 + timeLimit.s;
    onCreate({
      title: title.trim(),
      topics: selectedTopics,
      timeLimit: totalSeconds,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-white w-full max-w-lg rounded-[40px] p-8 space-y-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tighter">채팅방 만들기</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-black text-gray-900">방 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="어떤 대화를 나누고 싶나요?"
              className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold transition-all"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-gray-900">발송 제한시간 (최대 24시간)</label>
            <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-3xl justify-center">
              <TimePickerUnit value={timeLimit.h} label="시" onChange={(v) => setTimeLimit(prev => ({ ...prev, h: v }))} max={23} />
              <span className="text-2xl font-black text-gray-300">:</span>
              <TimePickerUnit value={timeLimit.m} label="분" onChange={(v) => setTimeLimit(prev => ({ ...prev, m: v }))} max={59} />
              <span className="text-2xl font-black text-gray-300">:</span>
              <TimePickerUnit value={timeLimit.s} label="초" onChange={(v) => setTimeLimit(prev => ({ ...prev, s: v }))} max={59} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-gray-900">관심 주제</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TOPICS.map(topic => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    selectedTopics.includes(topic)
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'bg-white border border-gray-100 text-gray-500'
                  }`}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full py-5 bg-orange-500 text-white rounded-[32px] font-black shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all"
        >
          채팅방 개설하기
        </button>
      </motion.div>
    </motion.div>
  );
};

function TimePickerUnit({ value, label, max, onChange }: { value: number; label: string; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        value={value === 0 ? '' : value.toString()}
        placeholder="0"
        onChange={(e) => {
          let val = e.target.value.replace(/[^0-9]/g, '');
          if (val.length > 2) {
            val = val.slice(-2);
          }
          const n = val === '' ? 0 : parseInt(val, 10);
          onChange(Math.min(max, n));
        }}
        onBlur={() => {
          if (value === undefined || isNaN(value)) onChange(0);
        }}
        className="w-16 h-16 bg-white border-2 border-transparent focus:border-orange-500 rounded-2xl text-center font-black text-xl outline-none transition-all shadow-sm"
      />
      <span className="text-[10px] font-black text-gray-400 uppercase">{label}</span>
    </div>
  );
}

export default CreateRoomModal;
