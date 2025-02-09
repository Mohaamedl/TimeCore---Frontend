import { CalendarEvent } from '@/store/CalendarStore';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/pt';

const API_URL = 'http://localhost:8080/api/events';


export const importEventsFromPDF = async (file: File): Promise<CalendarEvent[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(`${API_URL}/import`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Raw API Response:', response.data);

    if (!response.data) {
      throw new Error('No events found in PDF');
    }

    return response.data.map((event: any) => {
      try {
        const startDateTime = event.startDateTime;
        const endDateTime = event.endDateTime;

        if (!startDateTime || !endDateTime) {
          throw new Error('Missing datetime fields');
        }

        const start = moment.parseZone(startDateTime, moment.ISO_8601, true)
          .locale('pt')
          .utcOffset('+00:00', true)
          .add(1,'day'); // Set UTC+0 and preserve offset

        const end = moment.parseZone(endDateTime, moment.ISO_8601, true)
          .locale('pt')
          .utcOffset('+00:00', true)
          .add(1,'day');

        if (!start.isValid() || !end.isValid()) {
          throw new Error(`Invalid date format for event ${event.id}`);
        }

        // Debug dates
        console.log('Event dates:', {
          id: event.id,
          originalStart: startDateTime,
          originalEnd: endDateTime,
          parsedStart: start.format('YYYY-MM-DD HH:mm:ss Z'),
          parsedEnd: end.format('YYYY-MM-DD HH:mm:ss Z'),
          day: start.format('dddd')
        });

        return {
          id: event.id?.toString() || Date.now().toString(),
          title: event.summary || event.title || `Event ${event.id}`,
          description: event.description || event.location || '',
          start: start.toDate(),
          end: end.toDate(),
          isDraft: false
        };
      } catch (error) {
        console.error('Date parsing error:', error);
        throw error;
      }
    });

  } catch (error: any) {
    console.error('PDF Import Error:', error.response || error);
    throw new Error(error.response?.data || 'Failed to import events from PDF');
  }
};