
export interface UserData {
  id: string;
  attributes: {
    username: string;
    first_name: string;
    last_name: string;
    area: string;
    phone_number: string;
    email: string;
    start_point: string;
    university: string;
    faculty: string;
    confirmed: boolean;
    subscription: string;
    expoPushToken?: string;
    photo: {
      data: {
        id: string;
        attributes: {
          url: string;
        };
      };
    };
    bookings: {
      data: BookingData[];
    };
  };
}

export interface BookingData {
  id: string;
  attributes: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    destination: string;
    date: string;
    trip_type: string;
    trip_cost: number;
    area: string;
    start_point: string;
    start_time: string;
    end_time: string;
    seats: number;
    trip_status: string;
    payment_type: string;
    payment_status: string;
    user_id: {
      data: {
        id: string;
      };
    };
  };
}

export interface AreaData {
  id: string;
  attributes: {
    name: string;
    places: {
      data: PlaceData[];
    };
  };
}

export interface PlaceData {
  id: string;
  attributes: {
    place_name: string;
    one_way_price?: number;
    return_price?: number;
    round_trip_price?: number;
    timing?: string[];
  };
}

export interface UniversityData {
  id: string;
  attributes: {
    university_name: string;
    colleges: {
      data: CollegeData[];
    };
  };
}

export interface CollegeData {
  id: string;
  attributes: {
    faculty_name: string;
  };
}

export interface BookingDashboardData {
  attributes: {
    booking_status: boolean;
    booking_start_date: string;
    departure_time: string | { label: string; value: string }[];
    booking_days_count: number;
    available_bookings_count: number;
    cancel_friday_booking: boolean;
    end_of_day_time: string;
    notes: string;
  };
}

export interface GraphQLResponse {
  usersPermissionsUsers: {
    data: UserData[];
  };
  areas: {
    data: AreaData[];
  };
  universities: {
    data: UniversityData[];
  };
  bookingDashboards: {
    data: BookingDashboardData[];
  };
}

export interface AuthResponse {
  jwt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface BookingFormData {
  first_name: string;
  last_name: string; 
  phone: string;
  email: string;
  date: string;
  trip_type: string;
  area: string;
  start_point: string;
  destination: string;
  start_time: string;
  end_time: string;
  seats: string;
  payment_type: string;
  trip_cost: string;
  user_id: string;
}
