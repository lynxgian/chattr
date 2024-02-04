export const getFormattedTimestamp = (): string => {
    const currentDate = new Date();
  
  const year = currentDate.getFullYear().toString().slice(-2); // Get last two digits of the year
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = currentDate.getHours();
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const amOrPm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours from 24-hour format to 12-hour format
  const formattedHours = hours % 12 || 12;

  return `${month}/${day}/${year} ${formattedHours}:${minutes} ${amOrPm}`;

  };