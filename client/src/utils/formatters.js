import { format, formatDistanceToNow } from 'date-fns';

export const formatEventDate = (start, end) => {
  if (!start) return 'TBD';
  const startDate = new Date(start);
  if (!end) return format(startDate, 'MMM d, yyyy • h:mm a');
  const endDate = new Date(end);
  const sameDay = startDate.toDateString() === endDate.toDateString();
  return sameDay
    ? `${format(startDate, 'MMM d, yyyy • h:mm a')} - ${format(endDate, 'h:mm a')}`
    : `${format(startDate, 'MMM d, yyyy • h:mm a')} - ${format(endDate, 'MMM d, yyyy • h:mm a')}`;
};

export const fromNow = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatAttendeeCount = (count) => `${count} attendee${count === 1 ? '' : 's'}`;
