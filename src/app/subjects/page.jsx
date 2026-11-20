'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BookOpen,
  Plus,
  X,
  Trash2,
  Edit3,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getSubjects, saveSubjects } from '@/lib/storage';
import { SUBJECT_COLORS } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [color, setColor] = useState(SUBJECT_COLORS[0]);
  const [topicsText, setTopicsText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getSubjects()
      .then(setSubjects)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load subjects'))
      .finally(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  const resetForm = () => {
    setName('');
    setExamDate('');
    setPriority('medium');
    setColor(SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)]);
    setTopicsText('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !examDate) {
      toast.error('Please fill in subject name and exam date');
      return;
    }

    const topics = topicsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingId) {
        const updated = subjects.map((s) =>
          s.id === editingId ? { ...s, name: name.trim(), examDate, priority, color, topics } : s
        );
        await saveSubjects(updated);
        setSubjects(updated);
        toast.success('Subject updated!');
      } else {
        const newSubject = {
          id: uuidv4(),
          name: name.trim(),
          examDate,
          priority,
          color,
          topics,
        };
        const updated = [...subjects, newSubject];
        await saveSubjects(updated);
        setSubjects(updated);
        toast.success('Subject added!');
      }

      resetForm();
      setShowForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save subject');
    }
  };

  const handleEdit = (subject) => {
    setName(subject.name);
    setExamDate(subject.examDate);
    setPriority(subject.priority);
    setColor(subject.color);
    setTopicsText(subject.topics.join(', '));
    setEditingId(subject.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const updated = subjects.filter((s) => s.id !== id);
    try {
      await saveSubjects(updated);
      setSubjects(updated);
      toast.success('Subject deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete subject');
    }
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-teal-600" />
            Subjects
          </h1>
          <p className="text-slate-500 mt-1">Manage your subjects, exam dates, and topics</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showForm
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'gradient-primary text-white hover:shadow-lg hover:shadow-teal-200'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Subject'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-6 animate-scale-in">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Edit Subject' : 'Add New Subject'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Mathematics"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Exam Date *
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {['high', 'medium', 'low'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                        priority === p
                          ? priorityColors[p] + ' ring-2 ring-offset-1 ring-current'
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-teal-400 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">
                Topics (comma separated)
              </label>
              <input
                type="text"
                value={topicsText}
                onChange={(e) => setTopicsText(e.target.value)}
                placeholder="e.g., Calculus, Linear Algebra, Statistics"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-teal-200 transition-all"
              >
                {editingId ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No subjects yet</h3>
          <p className="text-sm text-slate-400 mb-6">
            Start by adding your subjects with their exam dates and topics.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:shadow-lg hover:shadow-teal-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover-lift"
            >
              <div className="p-5 flex items-center gap-4">
                <div
                  className="w-4 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: subject.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold text-slate-800">{subject.name}</h3>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${priorityColors[subject.priority]}`}
                    >
                      {subject.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(parseISO(subject.examDate), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {subject.topics.length} topics
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === subject.id ? null : subject.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    {expandedId === subject.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(subject)}
                    className="p-2 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Topics */}
              {expandedId === subject.id && subject.topics.length > 0 && (
                <div className="px-5 pb-4 border-t border-slate-50 pt-3 animate-scale-in">
                  <p className="text-xs font-medium text-slate-500 mb-2">Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {subject.topics.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs px-3 py-1 rounded-full border border-slate-200 text-slate-600 bg-slate-50"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
