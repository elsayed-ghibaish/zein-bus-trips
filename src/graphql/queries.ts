import { gql } from '@apollo/client';

export const GET_ALL_DATA = gql`
  query GETDATA {
    usersPermissionsUsers {
      data {
        id
        attributes {
          username
          first_name
          last_name
          area
          phone_number
          email
          start_point
          university
          faculty
          confirmed
          subscription
          photo {
            data {
              id
              attributes {
                url
              }
            }
          }
          bookings {
            data {
              id
              attributes {
                first_name
                last_name
                email
                phone
                destination
                date
                trip_type
                trip_cost
                area
                start_point
                start_time
                end_time
                seats
                trip_status
                payment_type
                payment_status
                user_id {
                  data {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
    areas {
      data {
        id
        attributes {
          name
          places {
            data {
              id
              attributes {
                place_name
                one_way_price
                return_price
                round_trip_price
                timing
              }
            }
          }
        }
      }
    }
    universities {
      data {
        id
        attributes {
          university_name
          colleges(pagination: { page: 1, pageSize: 20 }) {
            data {
              id
              attributes {
                faculty_name
              }
            }
          }
        }
      }
    }
    bookingDashboards {
      data {
        attributes {
          booking_status
          booking_start_date
          departure_time
          booking_days_count
          available_bookings_count
          cancel_friday_booking
          end_of_day_time
          notes
        }
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    usersPermissionsUser(id: $id) {
      data {
        id
        attributes {
          username
          first_name
          last_name
          area
          phone_number
          email
          start_point
          university
          faculty
          confirmed
          subscription
          photo {
            data {
              id
              attributes {
                url
              }
            }
          }
          bookings {
            data {
              id
              attributes {
                first_name
                last_name
                email
                phone
                destination
                date
                trip_type
                trip_cost
                area
                start_point
                start_time
                end_time
                seats
                trip_status
                payment_type
                payment_status
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_BOOKING_DASHBOARDS = gql`
  query GetBookingDashboards {
    bookingDashboards {
      data {
        attributes {
          booking_status
          booking_start_date
          departure_time
          booking_days_count
          available_bookings_count
          cancel_friday_booking
          end_of_day_time
          notes
        }
      }
    }
  }
`;

export const GET_AREAS = gql`
  query GetAreas {
    areas {
      data {
        id
        attributes {
          name
          places {
            data {
              id
              attributes {
                place_name
                one_way_price
                return_price
                round_trip_price
                timing
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_UNIVERSITIES = gql`
  query GetUniversities {
    universities {
      data {
        id
        attributes {
          university_name
          colleges(pagination: { page: 1, pageSize: 20 }) {
            data {
              id
              attributes {
                faculty_name
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: ID!) {
    notifications(filters: { users: { id: { eq: $userId } } }) {
      data {
        id
        attributes {
          title
          message
          read
          users {
            data {
              id
              attributes {
                username
              }
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_NOTIFICATION_READ = gql`
  mutation UpdateNotificationRead($id: ID!) {
    updateNotification(id: $id, data: { read: true }) {
      data {
        id
        attributes {
          read
        }
      }
    }
  }
`;
