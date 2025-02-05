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
    <div className='mx-auto max-w-screen-2xl px-4 md:px-8'>
      <div className="min-h-screen bg-gray-100">
      <div className="h-[100px]">
      </div>
        {/* Div1: Contenedor principal */}
        <div className="container mx-auto mt-20 w-11/12">
          {/* Div2: Sección horizontal dividida en 70% y 30% */}
          <div className="flex justify-between mb-8">
            <div className="w-8/9 p-3 bg-white shadow-md rounded-lg">
              <p className="text-center">lista de horario</p>
            </div>
            <div className="w-3/12 p-3 items-center justify-center shadow-md rounded-lg">
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
                  className="px-4 py-2 bg-green-500 text-white items-center justify-center rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Importing...' : 'Import PDF'}
                </button>
                {error && (
                <div className="w-full p-4 bg-red-100 text-red-700 rounded-md text-center">
                  {error}
                </div>
              )}
              
            </div>
          </div><br></br>

          {/* Div3: Sección vertical dividida en 70% y 30% */}
          <div className="flex flex-wrap gap-1 space-y-8">
            <div className="w-[69%] p-3 dark:bg-gray-800 shadow-md rounded-lg">
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
            <div className="w-[30%] p-3 dark:bg-gray-800 rounded-lg shadow-md">
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
      </div><br></br>

        {/* Div4: Footer */}
        <footer className="bg-blue-900 text-white text-center py-4 mt-8">
          <p>Gracias a estos desarrolladores</p>
        </footer>
      </div>
    </div>
    
  );
};

export default CalendarPage;