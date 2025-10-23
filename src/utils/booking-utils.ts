
import { format, addDays, getDay, isAfter, isBefore } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TripPoint {
  place_name: string;
  one_way_price?: number;
  return_price?: number;
  round_trip_price?: number;
  timing?: string[];
}

export interface PriceMapping {
  "ذهاب": number;
  "عودة": number;
  "ذهاب وعودة": number;
}

export const DEFAULT_ONE_WAY_PRICE = 50;
export const DEFAULT_RETURN_PRICE = 50;
export const DEFAULT_ROUND_TRIP_PRICE = 90;

/**
 * Calculate the trip cost based on trip type, seats, and selected point
 */
export const calculateTripCost = (
  tripType: string, 
  seats: string, 
  selectedPoint: TripPoint | null
): number => {
  if (!tripType || !seats) return 0;
  
  const seatCount = parseInt(seats, 10);
  if (isNaN(seatCount) || seatCount <= 0) return 0;

  // Default pricing if no point-specific pricing is available
  const defaultPricing: PriceMapping = {
    "ذهاب": DEFAULT_ONE_WAY_PRICE,
    "عودة": DEFAULT_RETURN_PRICE,
    "ذهاب وعودة": DEFAULT_ROUND_TRIP_PRICE
  };

  // If we have a selected point with pricing, use it
  if (selectedPoint) {
    const pointPricing: PriceMapping = {
      "ذهاب": selectedPoint.one_way_price || DEFAULT_ONE_WAY_PRICE,
      "عودة": selectedPoint.return_price || DEFAULT_RETURN_PRICE,
      "ذهاب وعودة": selectedPoint.round_trip_price || DEFAULT_ROUND_TRIP_PRICE
    };
    
    return pointPricing[tripType as keyof PriceMapping] * seatCount;
  }
  
  // Fallback to default pricing
  return defaultPricing[tripType as keyof PriceMapping] * seatCount;
};

/**
 * Generate a list of available days for booking
 */
export const generateAvailableDays = (
  startDate: string, 
  daysCount: number, 
  cancelFriday: boolean,
  endOfDayTime?: string
) => {
  if (!startDate) return [];
  
  const inputStartDate = new Date(startDate);
  const inputEndDate = addDays(inputStartDate, daysCount || 7);
  const today = new Date();
  
  // Check if there's a cutoff time for same-day bookings
  let cutoffTime = null;
  if (endOfDayTime) {
    const [hours, minutes] = endOfDayTime.split(':').map(part => parseInt(part, 10));
    cutoffTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hours || 18, // Default to 6 PM if not specified
      minutes || 0
    );
  }

  // Generate dates between start and end
  const dates = [];
  let currentDate = new Date(inputStartDate);
  
  while (currentDate <= inputEndDate) {
    // Skip if current date is in the past
    if (isBefore(currentDate, today) && !isSameDay(currentDate, today)) {
      currentDate = addDays(currentDate, 1);
      continue;
    }
    
    // Skip Fridays if canceled
    if (cancelFriday && getDay(currentDate) === 5) {
      currentDate = addDays(currentDate, 1);
      continue;
    }
    
    // Skip today if past cutoff time
    const isCurrentDay = isSameDay(currentDate, today);
    const isTomorrow = isSameDay(currentDate, addDays(today, 1));
    const isPastCutoff = cutoffTime && isAfter(today, cutoffTime);
    
    if ((isCurrentDay || isTomorrow) && isPastCutoff) {
      currentDate = addDays(currentDate, 1);
      continue;
    }
    
    // Format and add valid date
    dates.push({
      value: format(currentDate, 'yyyy-MM-dd'),
      label: format(currentDate, 'EEEE, d MMMM', { locale: ar })
    });
    
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

/**
 * Helper function to check if two dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Calculate available seats after considering existing bookings
 */
export const calculateAvailableSeats = (
  tripType: string,
  totalAvailableSeats: number,
  outboundBookedSeats: number,
  returnBookedSeats: number
): number => {
  let remainingSeats = 0;
  
  if (tripType === "ذهاب") {
    remainingSeats = totalAvailableSeats - outboundBookedSeats;
  } else if (tripType === "عودة") {
    remainingSeats = totalAvailableSeats - returnBookedSeats;
  } else if (tripType === "ذهاب وعودة") {
    // For round trips, we need to ensure both outbound and return have seats
    remainingSeats = Math.min(
      totalAvailableSeats - outboundBookedSeats,
      totalAvailableSeats - returnBookedSeats
    );
  }
  
  // Enforce maximum of 4 seats per booking and ensure positive number
  return Math.max(0, Math.min(remainingSeats, 4));
};
