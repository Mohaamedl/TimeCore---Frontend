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
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (eventId: string) => void;
  setDraftEvent: (event: CalendarEvent | null) => void;
  getEventsByMonth: (year: number, month: number) => CalendarEvent[];
}

export const useCalendarStore = create(
  persist<CalendarStore>(
    (set, get) => ({
      events: [],
      draftEvent: null,
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          isDraft: false
        }],
        draftEvent: null
      })),
      updateEvent: (updatedEvent) => set((state) => ({
        events: state.events.map(event => 
          event.id === updatedEvent.id ? {
            ...updatedEvent,
            start: new Date(updatedEvent.start),
            end: new Date(updatedEvent.end),
            isDraft: false
          } : event
        )
      })),
      deleteEvent: (eventId) => set((state) => ({
        events: state.events.filter(event => event.id !== eventId)
      })),
      setDraftEvent: (event) => set({ 
        draftEvent: event ? {
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        } : null 
      }),
      getEventsByMonth: (year, month) => {
        return get().events.filter(event => {
          const eventDate = new Date(event.start);
          return eventDate.getFullYear() === year && 
                 eventDate.getMonth() === month;
        });
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
              events: parsed.state.events.map((event: any) => ({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
              })),
              draftEvent: parsed.state.draftEvent ? {
                ...parsed.state.draftEvent,
                start: new Date(parsed.state.draftEvent.start),
                end: new Date(parsed.state.draftEvent.end)
              } : null
            }
          };
        },
        setItem: (key, value) => {
          const serialized = {
            ...value,
            state: {
              ...value.state,
              events: value.state.events.map((event: any) => ({
                ...event,
                start: event.start.toISOString(),
                end: event.end.toISOString()
              })),
              draftEvent: value.state.draftEvent ? {
                ...value.state.draftEvent,
                start: value.state.draftEvent.start.toISOString(),
                end: value.state.draftEvent.end.toISOString()
              } : null
            }
          };
          localStorage.setItem(key, JSON.stringify(serialized));
        },
        removeItem: (key) => localStorage.removeItem(key)
      }
    }
  )
);