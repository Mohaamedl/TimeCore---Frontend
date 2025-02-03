import { importEventsFromPDF } from '@/services/eventService';
import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore';
import moment from 'moment';
import { FC, useCallback, useRef, useState } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../css/CalendarPage.css';

const localizer = momentLocalizer(moment);

const CalendarPage: FC = () => {
  const [view, setView] = useState<View>('month');
  const { events, addEvent, updateEvent, deleteEvent, draftEvent, setDraftEvent, addEvents } = useCalendarStore();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    const newEvent = { 
      id: Date.now().toString(),
      title: 'New Event',
      start: new Date(start),
      end: new Date(end),
      isDraft: true
    };
    setDraftEvent(newEvent);
    setSelectedEvent(newEvent);
    setIsNewEvent(true);
  }, [setDraftEvent]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsNewEvent(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      if (isNewEvent) {
        addEvent(selectedEvent);
      } else {
        updateEvent(selectedEvent);
      }
      setSelectedEvent(null);
      setDraftEvent(null);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File import started');
    const file = e.target.files?.[0];
    
    if (!file) {
      setError('Please select a file');
      return;
    }
  
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
  
    if (!file.type.includes('pdf')) {
      setError('Please select a valid PDF file');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const importedEvents = await importEventsFromPDF(file);
      console.log('Events imported:', importedEvents);
      
      if (importedEvents?.length) {
        addEvents(importedEvents);
        console.log('Events added to store');
      } else {
        setError('No events found in PDF');
      }
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Import error:', {
        message: error.message,
        stack: error.stack
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
      console.log('Import process completed');
    }
  };

  const allEvents = [...events, ...(draftEvent ? [draftEvent] : [])];

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.isDraft ? '#795548' : '#4caf50',
        opacity: event.isDraft ? 0.7 : 1
      }
    };
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] gap-4 p-4 bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        {/* Import Button */}
        <div className="mb-4 flex justify-end">
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,application/pdf"
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Importing...' : 'Import PDF'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100% - 60px)' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onView={setView}
          view={view}
          selectable
          popup
          longPressThreshold={250}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          messages={{
            noEventsInRange: 'No events scheduled',
            allDay: 'All day',
            date: 'Date',
            time: 'Time',
            event: 'Event',
          }}
        />
      </div>
      
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 text-green-600 dark:text-green-400">
          {isNewEvent ? 'Add New Event' : 'Edit Event'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              title="Event Title"
              placeholder="Enter event title..."
              value={selectedEvent?.title || ''}
              onChange={e => setSelectedEvent((prev: any) => 
                prev ? { ...prev, title: e.target.value } : null
              )}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              Description
            </label>
            <textarea
              title="Event Description"
              placeholder="Enter event description..."
              value={selectedEvent?.description || ''}
              onChange={e => setSelectedEvent(prev => 
                prev ? { ...prev, description: e.target.value } : null
              )}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              rows={4}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              {isNewEvent ? 'Add Event' : 'Update Event'}
            </button>
            {!isNewEvent && selectedEvent && (
              <button
                type="button"
                onClick={() => {
                  deleteEvent(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalendarPage;