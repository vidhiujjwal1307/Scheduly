'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { getActiveStudyPlan, getStudyPlans, saveStudyPlans } from '@/lib/storage';
import toast from 'react-hot-toast';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TimetablePage() {
  const [plan, setPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(new Date()));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getActiveStudyPlan()
      .then((active) => {
        setPlan(active);
        if (active?.sessions.length) {
          const firstSessionDate = active.sessions[0].date;
          setSelectedDate(firstSessionDate);
          setVisibleMonth(startOfMonth(parseISO(firstSessionDate)));
        }
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load timetable'))
      .finally(() => setMounted(true));
  }, []);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth));
    const end = endOfWeek(endOfMonth(visibleMonth));
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  if (!mounted) {
    return <div className="p-8 text-slate-400">Loading calendar...</div>;
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center">
          <CalendarDays className="mx-auto mb-4 h-16 w-16 text-teal-200" />
          <h1 className="mb-2 text-xl font-semibold text-slate-700">Your learning calendar is ready</h1>
          <p className="mb-6 text-sm text-slate-400">
            Generate a study plan to see your daily sessions and track your progress here.
          </p>
          <Link
            href="/generate"
            className="gradient-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white"
          >
            <Sparkles className="h-4 w-4" /> Generate a plan
          </Link>
        </div>
      </div>
    );
  }

  const selectedSessions = plan.sessions.filter((session) => session.date === selectedDate);
  const completedSessions = plan.sessions.filter((session) => session.completed).length;
  const progress = plan.sessions.length
    ? Math.round((completedSessions / plan.sessions.length) * 100)
    : 0;
  const sessionsByDate = new Map();
  for (const session of plan.sessions) {
    const sessions = sessionsByDate.get(session.date) || [];
    sessions.push(session);
    sessionsByDate.set(session.date, sessions);
  }

  const moveMonth = (amount) => {
    const nextMonth = amount > 0 ? addMonths(visibleMonth, amount) : subMonths(visibleMonth, -amount);
    setVisibleMonth(nextMonth);
    const nextMonthSessions = plan.sessions.find((session) =>
      isSameMonth(parseISO(session.date), nextMonth)
    );
    setSelectedDate(
      nextMonthSessions?.date || format(startOfMonth(nextMonth), 'yyyy-MM-dd')
    );
  };

  const selectToday = () => {
    const today = new Date();
    setVisibleMonth(startOfMonth(today));
    setSelectedDate(format(today, 'yyyy-MM-dd'));
  };

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
    <div className="mx-auto max-w-6xl animate-fade-in p-5 sm:p-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-800">
            <CalendarDays className="h-8 w-8 text-teal-600" /> Learning Calendar
          </h1>
          <p className="mt-1 text-slate-500">
            Track each study session as you work toward your exams.
          </p>
        </div>
        <div className="min-w-52 rounded-2xl border border-teal-100 bg-teal-50 px-5 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-teal-900">Plan progress</span>
            <span className="font-bold text-teal-700">{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className="gradient-primary h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-teal-700">
            {completedSessions} of {plan.sessions.length} sessions complete
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {format(visibleMonth, 'MMMM yyyy')}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {plan.sessions.length} planned sessions across{' '}
              {new Set(plan.sessions.map((session) => session.date)).size} study days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectToday}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
              {day}
            </div>
          ))}
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const daySessions = sessionsByDate.get(dateKey) || [];
            const dayCompleted = daySessions.filter((session) => session.completed).length;
            const isSelected = selectedDate === dateKey;
            const inMonth = isSameMonth(day, visibleMonth);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => setSelectedDate(dateKey)}
                aria-pressed={isSelected}
                aria-label={`${format(day, 'EEEE, MMMM d')}, ${dayCompleted} of ${daySessions.length} sessions completed`}
                className={`min-h-20 rounded-2xl border p-1.5 text-left transition sm:min-h-24 sm:p-2 ${
                  isSelected
                    ? 'border-teal-700 bg-teal-700 text-white shadow-md shadow-teal-900/15'
                    : inMonth
                      ? 'border-slate-100 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/70'
                      : 'border-transparent bg-slate-50/70 text-slate-300'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday(day) && !isSelected ? 'bg-teal-100 text-teal-800' : ''
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {daySessions.length > 0 && (
                  <>
                    <span
                      className={`mt-1 block truncate text-[10px] font-medium sm:text-xs ${
                        isSelected ? 'text-teal-50' : 'text-slate-500'
                      }`}
                    >
                      {dayCompleted}/{daySessions.length} done
                    </span>
                    <span className="mt-1 flex gap-1">
                      {daySessions.slice(0, 4).map((session) => (
                        <span
                          key={session.id}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: isSelected ? '#ccfbf1' : session.completed ? '#0f766e' : session.color,
                          }}
                        />
                      ))}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {format(parseISO(selectedDate), 'EEEE, MMMM d')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedSessions.length
                ? `${selectedSessions.length} session${selectedSessions.length === 1 ? '' : 's'} planned`
                : 'No sessions planned for this day'}
            </p>
          </div>
          {selectedSessions.length > 0 && (
            <span className="text-sm font-medium text-teal-700">
              {selectedSessions.filter((session) => session.completed).length}/{selectedSessions.length} complete
            </span>
          )}
        </div>

        {selectedSessions.length ? (
          <div className="space-y-3">
            {selectedSessions.map((session) => (
              <article
                key={session.id}
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 transition sm:p-5 ${
                  session.completed ? 'border-teal-100 bg-teal-50/40' : 'border-slate-100'
                }`}
              >
                <div className="h-12 w-1 shrink-0 rounded-full" style={{ backgroundColor: session.color }} />
                <div className="w-24 shrink-0">
                  <p className="text-sm font-bold text-slate-700">{session.startTime}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3 w-3" /> {session.duration} min
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-semibold ${session.completed ? 'text-teal-800' : 'text-slate-800'}`}>
                    {session.subjectName}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {session.topics.map((topic) => (
                      <span key={topic} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSession(session.id)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                    session.completed
                      ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                      : 'bg-slate-50 text-slate-300 hover:bg-teal-50 hover:text-teal-600'
                  }`}
                  aria-label={session.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
            Select a marked day to review its sessions, or generate a new plan for upcoming exams.
          </div>
        )}
      </section>
    </div>
  );
}
