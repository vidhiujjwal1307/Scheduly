'use client';

import { useEffect, useState } from 'react';
import { Sparkles, AlertCircle, Loader2, CheckCircle, BookOpen, Clock, Calendar } from 'lucide-react';
import { getSubjects, getPreferences } from '@/lib/storage';
import { DEFAULT_PREFERENCES } from '@/lib/constants';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function GeneratePage() {
  const [subjects, setSubjects] = useState([]);
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.all([getSubjects(), getPreferences()])
      .then(([loadedSubjects, preferences]) => {
        setSubjects(loadedSubjects);
        setPrefs(preferences);
      })
      .catch((loadError) => toast.error(loadError instanceof Error ? loadError.message : 'Failed to load plan data'))
      .finally(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const hasApiKey = prefs.hasGroqApiKey;

  const handleGenerate = async () => {
    if (!hasApiKey) {
      toast.error('Please set your Groq API key in Settings first');
      return;
    }
    if (subjects.length === 0) {
      toast.error('Please add at least one subject first');
      return;
    }

    setLoading(true);
    setError('');
    setGenerated(false);

    try {
      const response = await fetch('/api/generate', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate plan');
      }
      const newPlan = result.plan;
      setPlan(newPlan);
      setGenerated(true);
      toast.success('Study plan generated successfully! 🎉');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate plan';
      setError(message);
      toast.error('Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-teal-600" />
          Generate Study Plan
        </h1>
        <p className="text-slate-500 mt-1">
          AI will create a personalized, day-wise study timetable for you
        </p>
      </div>

      {/* Configuration Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Plan Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-teal-50 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-teal-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-teal-800">{prefs.dailyStudyHours}h/day</p>
            <p className="text-xs text-teal-500">Daily Study Hours</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-4 text-center">
            <Calendar className="w-6 h-6 text-teal-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-teal-800">{prefs.preferredStartTime}</p>
            <p className="text-xs text-teal-500">Start Time</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <BookOpen className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-emerald-700">{prefs.breakDuration}min</p>
            <p className="text-xs text-emerald-400">Break Duration</p>
          </div>
        </div>
      </div>

      {/* Subjects to Plan */}
      {subjects.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-6">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Subjects in Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.examDate} · {s.priority} priority</p>
                </div>
                <span className="text-xs text-slate-400">{s.topics.length} topics</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all ${
            loading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'gradient-primary text-white hover:shadow-xl hover:shadow-teal-200 hover:-translate-y-0.5'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Your Study Plan...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Study Plan with AI
            </>
          )}
        </button>
        {loading && (
          <p className="text-sm text-slate-400 mt-3 animate-pulse">
            This may take 10-20 seconds...
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-4 animate-scale-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Generation Failed</p>
              <p className="text-xs text-red-500 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {generated && plan && (
        <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-6 animate-scale-in">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            <h3 className="text-lg font-semibold text-emerald-800">Plan Generated! 🎉</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-700">{plan.sessions.length}</p>
              <p className="text-xs text-emerald-500">Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-700">{plan.totalHours}h</p>
              <p className="text-xs text-emerald-500">Total Study</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-700">
                {new Set(plan.sessions.map((s) => s.date)).size}
              </p>
              <p className="text-xs text-emerald-500">Days</p>
            </div>
          </div>
          <Link
            href="/timetable"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
          >
            <Calendar className="w-4 h-4" />
            View Timetable →
          </Link>
        </div>
      )}
    </div>
  );
}
