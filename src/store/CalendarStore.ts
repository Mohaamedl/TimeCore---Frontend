import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  isDraft?: boolean;
}

interface CalendarStore {
  events: CalendarEvent[];
  draftEvent: CalendarEvent | null;
  addEvent: (event: CalendarEvent) => void;
  addEvents: (newEvents: CalendarEvent[]) => void;
  clearEvents: () => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  setDraftEvent: (event: CalendarEvent | null) => void;
  getEventsByMonth: (year: number, month: number) => CalendarEvent[];
}

export const useCalendarStore = create(
  persist<CalendarStore>(
    (set) => ({
      events: [],
      draftEvent: null,
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (event) => set((state) => ({
        events: state.events.map((e) => (e.id === event.id ? event : e))
      })),
      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      })),
      setDraftEvent: (event) => set({ draftEvent: event }),
      addEvents: (newEvents) => set((state) => ({
        events: [...state.events, ...newEvents]
      })),
      getEventsByMonth: (year, month) => {
        return get().events.filter((event: CalendarEvent) => 
          event.start.getFullYear() === year && 
          event.start.getMonth() === month
        );
      },
      clearEvents: () => {
        set({ events: [], draftEvent: null });
        localStorage.removeItem('calendar-storage');
      }
    }),
    {
      name: 'calendar-storage',
      storage: {
        getItem: (key) => {
          const str = localStorage.getItem(key);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              events: [],
              draftEvent: null
            }
          };
        },
        setItem: (key, value) => {
          localStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => localStorage.removeItem(key)
      }
    }
  )
);
function get() {
  return useCalendarStore.getState();
}

