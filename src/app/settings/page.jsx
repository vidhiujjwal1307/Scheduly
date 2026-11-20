'use client';

import { useEffect, useState } from 'react';
import { Settings, KeyRound, Clock, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPreferences, savePreferences } from '@/lib/storage';
import { DEFAULT_PREFERENCES } from '@/lib/constants';

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load settings'))
      .finally(() => setMounted(true));
  }, []);

  if (!mounted) return <div className="p-8 text-slate-400">Loading...</div>;

  const save = async () => {
    try {
      setPrefs(await savePreferences(prefs));
      toast.success('Settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><Settings className="w-8 h-8 text-teal-600" /> Settings</h1>
        <p className="text-slate-500 mt-1">Configure your study preferences and AI key</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-6">
        <div>
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2"><KeyRound className="w-4 h-4 text-teal-600" /> Groq API Key</label>
          <input type="password" value={prefs.groqApiKey} onChange={(event) => setPrefs({ ...prefs, groqApiKey: event.target.value })} placeholder="Enter your Groq API key" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          <p className="text-xs text-slate-400 mt-2">
            {prefs.hasGroqApiKey
              ? 'A key is saved. Leave this blank to keep it, or enter a new key.'
              : 'Stored in the local database. Sent to Groq only when you generate a study plan.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-teal-600" /> Daily Study Hours</label>
            <input type="number" min="1" max="12" value={prefs.dailyStudyHours} onChange={(event) => setPrefs({ ...prefs, dailyStudyHours: Number(event.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-teal-600" /> Preferred Start Time</label>
            <input type="time" value={prefs.preferredStartTime} onChange={(event) => setPrefs({ ...prefs, preferredStartTime: event.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2"><Coffee className="w-4 h-4 text-emerald-500" /> Break Duration (minutes)</label>
          <input type="number" min="5" max="60" value={prefs.breakDuration} onChange={(event) => setPrefs({ ...prefs, breakDuration: Number(event.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        <div className="flex justify-end">
          <button onClick={save} className="px-6 py-3 rounded-xl gradient-primary text-white text-sm font-medium">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
