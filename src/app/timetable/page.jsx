'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { getActiveStudyPlan, getStudyPlans, saveStudyPlans } from '@/lib/storage';
import toast from 'react-hot-toast';

export default function TimetablePage() {
  const [plan, setPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getActiveStudyPlan()
      .then((active) => {
        setPlan(active);
        setSelectedDate(active?.sessions[0]?.date || '');
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load timetable'))
      .finally(() => setMounted(true));
  }, []);

  if (!mounted) {
    return <div className="p-8 text-slate-400">Loading...</div>;
  }

  if (!plan) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-700 mb-2">No timetable yet</h1>
          <p className="text-sm text-slate-400 mb-6">Generate a study plan to see your day-wise schedule.</p>
          <Link href="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
            <Sparkles className="w-4 h-4" /> Generate Plan
          </Link>
        </div>
      </div>
    );
  }

  const dates = [...new Set(plan.sessions.map((session) => session.date))];
  const daySessions = plan.sessions.filter((session) => session.date === selectedDate);

  const toggleSession = async (id) => {
    const updated = {
      ...plan,
      sessions: plan.sessions.map((session) =>
        session.id === id ? { ...session, completed: !session.completed } : session
      ),
    };
    try {
      const plans = await getStudyPlans();
      await saveStudyPlans(plans.map((item) => (item.id === updated.id ? updated : item)));
      setPlan(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update study session');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-500" /> Timetable
          </h1>
          <p className="text-slate-500 mt-1">{plan.sessions.length} sessions across {dates.length} days</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-3 rounded-xl text-sm transition-all ${selectedDate === date ? 'gradient-primary text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="block font-semibold">{format(parseISO(date), 'EEE')}</span>
              <span className="block text-xs mt-0.5 opacity-80">{format(parseISO(date), 'MMM d')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {daySessions.map((session) => (
          <div key={session.id} className={`bg-white rounded-2xl border p-5 flex items-center gap-4 transition-all ${session.completed ? 'border-emerald-100 opacity-60' : 'border-slate-100'}`}>
            <div className="w-1 h-14 rounded-full" style={{ backgroundColor: session.color }} />
            <div className="w-24 shrink-0">
              <p className="text-sm font-bold text-slate-700">{session.startTime}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {session.duration} min</p>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${session.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{session.subjectName}</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {session.topics.map((topic) => <span key={topic} className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-500">{topic}</span>)}
              </div>
            </div>
            <button
              onClick={() => toggleSession(session.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${session.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50'}`}
              aria-label={session.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
