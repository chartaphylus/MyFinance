import { useState, useEffect } from 'react';
import { supabase, Event, Transaction } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHolidays } from '../hooks/useHolidays';

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch holidays for the current year
  const { holidays } = useHolidays(currentMonth.getFullYear());

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    type: 'personal',
  });

  useEffect(() => {
    if (user) {
      loadEvents();
      loadTransactions();
    }
  }, [user]);

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const eventData = {
      user_id: user!.id,
      title: formData.title,
      description: formData.description || null,
      date: formData.date,
      time: formData.time || null,
      type: formData.type,
    };

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([eventData]);
        if (error) throw error;
      }
      closeModal();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  function openModal(event?: Event) {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        time: event.time || '',
        type: event.type,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        type: 'personal',
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEvent(null);
  }

  // === Kalender Grid Helper ===
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const dates: Date[] = [];
  for (let i = 0; i < startDay; i++) {
    dates.push(new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), -i));
  }
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const eventsByDate = (date: Date) =>
    events.filter((e) => new Date(e.date).toDateString() === date.toDateString());

  const getDayHoliday = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return holidays.find(h => {
      const hDate = new Date(h.tanggal);
      return hDate.getFullYear() === year &&
        hDate.getMonth() === (month - 1) &&
        hDate.getDate() === day;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Events</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            <ChevronLeft className="w-5 h-5 text-cyan-500" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            <ChevronRight className="w-5 h-5 text-cyan-500" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center font-medium text-slate-600 dark:text-slate-400">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>



        <div className="grid grid-cols-7 gap-2 mt-2">
          {dates.map((date, idx) => {
            const dayEvents = eventsByDate(date);
            const holiday = getDayHoliday(date);

            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const inMonth = date.getMonth() === currentMonth.getMonth();
            const isSunday = date.getDay() === 0;

            // Text color logic
            let textColor = "text-slate-600 dark:text-slate-400"; // default
            if (inMonth) {
              if (isSunday || holiday) {
                textColor = "text-red-500 dark:text-red-400 font-medium";
              } else {
                textColor = "text-slate-900 dark:text-slate-100";
              }
            } else {
              textColor = "text-slate-300 dark:text-slate-700";
            }

            if (isSelected) textColor = "text-white";

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded-lg text-sm relative min-h-[80px] text-left transition-colors flex flex-col items-start gap-1 group
                  ${textColor}
                  ${isToday ? "border border-cyan-500 font-bold" : "border border-transparent"}
                  ${isSelected ? "bg-cyan-500 shadow-md" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                `}
              >
                <div className="flex justify-between w-full">
                  <span className={`${(isSunday || holiday) && !isSelected ? 'text-red-500 dark:text-red-400' : ''}`}>
                    {date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayEvents.slice(0, 3).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-cyan-500'}`} />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Events on {selectedDate.toLocaleDateString()}
            </h3>

            {getDayHoliday(selectedDate) && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                {getDayHoliday(selectedDate)?.keterangan}
              </div>
            )}

            <div className="space-y-2 mt-2">
              {eventsByDate(selectedDate).length > 0 ? (
                eventsByDate(selectedDate).map((event) => (
                  <div key={event.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{event.title}</p>
                      {event.description && <p className="text-sm text-slate-500 dark:text-slate-400">{event.description}</p>}
                      <p className="text-xs text-slate-500 dark:text-slate-400">{event.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(event)} className="text-cyan-500 hover:text-cyan-400">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No events</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                required
              />
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 border rounded-lg py-2 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg py-2">
                  {editingEvent ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

