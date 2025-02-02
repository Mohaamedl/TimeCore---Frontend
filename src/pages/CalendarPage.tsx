import { FC, useState } from 'react';
import { Calendar, momentLocalizer, Event, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarEvent extends Event {
  id: number;
  description: string;
}

interface TimeSlot {
  id: number;
  time: string;
}

const localizer = momentLocalizer(moment);

const CalendarPage: FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [timeSlots] = useState<TimeSlot[]>([
    { id: 1, time: '10:00 AM' },
    { id: 2, time: '12:00 PM' },
    { id: 3, time: '02:00 PM' },
  ]);

  
};

export default CalendarPage;