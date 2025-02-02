import { FC, useState } from 'react';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarEvent extends Event {
  id?: string;
  title: string;
  description?: string;
}

const CalendarPage: FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent({ start, end, title: '' });
    setIsNewEvent(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsNewEvent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEvent) {
      if (isNewEvent) {
        setEvents([...events, { ...selectedEvent, id: Date.now().toString() }]);
      } else {
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? selectedEvent : event
        ));
      }
      setSelectedEvent(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] gap-4 p-4 bg-gray-100 dark:bg-gray-900">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <Calendar
          localizer={momentLocalizer(moment)}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          popup
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
              value={selectedEvent?.title || ''}
              onChange={e => setSelectedEvent(prev => 
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
                  setEvents(events.filter(e => e.id !== selectedEvent.id));
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