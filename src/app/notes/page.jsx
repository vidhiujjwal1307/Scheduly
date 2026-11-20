'use client';

import { useEffect, useState } from 'react';
import { StickyNote, Plus, Pin, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { getNotes, saveNotes } from '@/lib/storage';
import { NOTE_COLORS } from '@/lib/constants';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getNotes()
      .then(setNotes)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load notes'))
      .finally(() => setMounted(true));
  }, []);

  if (!mounted) return <div className="p-8 text-slate-400">Loading...</div>;

  const addNote = async () => {
    if (!title.trim()) {
      toast.error('Please add a note title');
      return;
    }
    const now = new Date().toISOString();
    const note = {
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      createdAt: now,
      updatedAt: now,
      pinned: false,
    };
    const updated = [note, ...notes];
    try {
      await saveNotes(updated);
      setNotes(updated);
      setTitle('');
      setContent('');
      toast.success('Note added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save note');
    }
  };

  const togglePin = async (id) => {
    const updated = notes.map((note) => note.id === id ? { ...note, pinned: !note.pinned } : note)
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
    try {
      await saveNotes(updated);
      setNotes(updated);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update note');
    }
  };

  const deleteNote = async (id) => {
    const updated = notes.filter((note) => note.id !== id);
    try {
      await saveNotes(updated);
      setNotes(updated);
      toast.success('Note deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete note');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><StickyNote className="w-8 h-8 text-indigo-500" /> Notes</h1>
        <p className="text-slate-500 mt-1">Capture quick study notes and reminders</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-6">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Note title" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 mb-3" />
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write something..." rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
        <div className="flex justify-end mt-3">
          <button onClick={addNote} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium"><Plus className="w-4 h-4" /> Add Note</button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <StickyNote className="w-14 h-14 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No notes yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <article key={note.id} className="rounded-2xl p-5 border border-black/5 min-h-44" style={{ backgroundColor: note.color }}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-slate-800">{note.title}</h2>
                <div className="flex shrink-0">
                  <button onClick={() => togglePin(note.id)} className={`p-1.5 rounded-lg ${note.pinned ? 'text-indigo-600' : 'text-slate-400'}`} aria-label="Pin note"><Pin className="w-4 h-4" /></button>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600" aria-label="Delete note"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {note.content && <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{note.content}</p>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
