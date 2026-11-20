'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { getSubjects, getActiveStudyPlan, getNotes } from '@/lib/storage';
import { format, differenceInDays, parseISO, isAfter } from 'date-fns';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [plan, setPlan] = useState(null);
  const [noteCount, setNoteCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.all([getSubjects(), getActiveStudyPlan(), getNotes()])
      .then(([loadedSubjects, loadedPlan, notes]) => {
        setSubjects(loadedSubjects);
        setPlan(loadedPlan);
        setNoteCount(notes.length);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load dashboard'))
      .finally(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const todaySessions = plan?.sessions.filter((s) => s.date === todayStr) || [];
  const completedToday = todaySessions.filter((s) => s.completed).length;
  const totalSessions = plan?.sessions.length || 0;
  const completedTotal = plan?.sessions.filter((s) => s.completed).length || 0;
  const progressPercent = totalSessions > 0 ? Math.round((completedTotal / totalSessions) * 100) : 0;

  const upcomingExams = subjects
    .filter((s) => isAfter(parseISO(s.examDate), today))
    .sort((a, b) => parseISO(a.examDate).getTime() - parseISO(b.examDate).getTime())
    .slice(0, 4);

  const stats = [
    {
      label: 'Subjects',
      value: subjects.length,
      icon: BookOpen,
      color: 'bg-indigo-50 text-indigo-600',
      iconColor: 'text-indigo-500',
    },
    {
      label: "Today's Sessions",
      value: `${completedToday}/${todaySessions.length}`,
      icon: Calendar,
      color: 'bg-purple-50 text-purple-600',
      iconColor: 'text-purple-500',
    },
    {
      label: 'Study Hours',
      value: plan?.totalHours || 0,
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-600',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Notes',
      value: noteCount,
      icon: Target,
      color: 'bg-amber-50 text-amber-600',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 17 ? 'Afternoon' : 'Evening'}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {format(today, 'EEEE, MMMM d, yyyy')} — Here&apos;s your study overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover-lift cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Study Progress
            </h2>
            <span className="text-sm font-medium text-indigo-600">{progressPercent}%</span>
          </div>

          {plan ? (
            <>
              <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
                <div
                  className="h-3 rounded-full gradient-primary transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-lg font-bold text-slate-700">{totalSessions}</p>
                  <p className="text-xs text-slate-400">Total Sessions</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-lg font-bold text-emerald-600">{completedTotal}</p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-lg font-bold text-amber-600">{totalSessions - completedTotal}</p>
                  <p className="text-xs text-slate-400">Remaining</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No study plan generated yet</p>
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-200 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate Study Plan
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Upcoming Exams
          </h2>

          {upcomingExams.length > 0 ? (
            <div className="space-y-3">
              {upcomingExams.map((subject) => {
                const daysLeft = differenceInDays(parseISO(subject.examDate), today);
                const isUrgent = daysLeft <= 3;

                return (
                  <div
                    key={subject.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isUrgent ? 'border-red-100 bg-red-50' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{subject.name}</p>
                      <p className="text-xs text-slate-400">
                        {format(parseISO(subject.examDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        isUrgent
                          ? 'bg-red-100 text-red-600'
                          : daysLeft <= 7
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {daysLeft}d left
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No upcoming exams</p>
              <Link href="/subjects" className="text-xs text-indigo-500 hover:underline mt-1 inline-block">
                Add subjects →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      {todaySessions.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Today&apos;s Schedule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-xl border-l-4 ${
                  session.completed ? 'bg-slate-50 opacity-60' : 'bg-white border border-slate-100'
                }`}
                style={{ borderLeftColor: session.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{session.subjectName}</span>
                  {session.completed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-xs text-slate-400">
                  {session.startTime} - {session.endTime} · {session.duration}min
                </p>
                {session.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {session.topics.slice(0, 2).map((topic) => (
                      <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
