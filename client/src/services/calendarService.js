import { format } from 'date-fns';

const formatDate = (date) => format(new Date(date), "yyyyMMdd'T'HHmmss'Z'");

export const generateGoogleCalendarLink = ({ title, description, start, end, location }) => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location,
    dates: `${formatDate(start)}/${formatDate(end || start)}`
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

export const generateICS = ({ title, description, start, end, location }) => {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventChain//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end || start)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\n');
};
