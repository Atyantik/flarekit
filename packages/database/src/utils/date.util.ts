/**
 * Convert a date to SQLite's UTC timestamp format (YYYY-MM-DD HH:MM:SS).
 * - If input matches `YYYY-MM-DD HH:MM:SS`, validate it by appending "Z" (UTC).
 * - If input is an ISO string or Date object, convert to UTC properly.
 * - Throws an error if the input is an invalid date.
 */
export const toSQLiteUTCString = (
  date?: string | Date | null,
): string | null => {
  if (!date) return null;

  try {
    let parsedDate: Date;

    if (typeof date === 'string') {
      const trimmedDate = date.trim();

      // If already in "YYYY-MM-DD HH:MM:SS" format, validate it
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmedDate)) {
        parsedDate = new Date(trimmedDate + 'Z'); // Ensure it's treated as UTC
        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Invalid date format: ${date}`);
        }
      } else {
        // Try parsing the string into a Date object
        parsedDate = new Date(trimmedDate);
        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Invalid date format: ${date}`);
        }
      }
    } else {
      // If it's a Date object, use it directly
      parsedDate = date;
    }

    // Ensure UTC conversion and return SQLite timestamp format
    return parsedDate.toISOString().replace('T', ' ').split('.')[0]; // Remove milliseconds and 'Z'
  } catch (err) {
    throw new Error(
      `Failed to convert date: ${date} - ${err instanceof Error ? err?.message : ''}`,
    );
  }
};
