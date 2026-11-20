'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  StickyNote,
  Settings,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/generate', label: 'Generate Plan', icon: Sparkles },
  { href: '/timetable', label: 'Timetable', icon: Calendar },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-200">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Scheduly</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              AI Study Planner
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? 'text-indigo-500'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {item.label}
              {item.href === '/generate' && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-semibold rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-600 mb-1">Pro Tip 💡</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Add all your subjects first, then generate an AI-powered study plan!
          </p>
        </div>
      </div>
    </aside>
  );
}
