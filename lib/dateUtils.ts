import { DateTime } from "luxon";

export const formatDate = (date: string | Date) => {
  return DateTime.fromISO(typeof date === 'string' ? date : date.toISOString())
    .toLocal()
    .toFormat("MMM d, yyyy");
};

export const formatDateTime = (date: string | Date) => {
  return DateTime.fromISO(typeof date === 'string' ? date : date.toISOString())
    .toLocal()
    .toFormat("MMM d, yyyy 'at' h:mm a");
};

export const formatRelative = (date: string | Date) => {
  return DateTime.fromISO(typeof date === 'string' ? date : date.toISOString())
    .toLocal()
    .toRelative();
};