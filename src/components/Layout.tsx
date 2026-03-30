import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Users, MessageSquare, Mic, BrainCircuit } from 'lucide-react';
import Logo from './Logo';

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Users, label: '친구' },
    { path: '/text-chat', icon: MessageSquare, label: '문자로' },
    { path: '/voice-chat', icon: Mic, label: '소리로' },
    { path: '/practice', icon: BrainCircuit, label: '연습하기' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Web: Top Bar */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <div className="flex flex-col -space-y-1">
            <h1 className="text-xl font-black text-orange-500 tracking-tighter">식사하셨어요?</h1>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ImFine</span>
          </div>
        </div>
        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 font-bold transition-colors ${
                  isActive ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="w-10 h-10 rounded-full bg-gray-200" />
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile: Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-400'
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
