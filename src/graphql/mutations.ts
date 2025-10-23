import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $phoneNumber: String!
    $area: String!
    $startPoint: String!
    $university: String!
    $faculty: String!
  ) {
    register(
      input: {
        username: $username
        email: $email
        password: $password
        first_name: $firstName
        last_name: $lastName
        phone_number: $phoneNumber
        area: $area
        start_point: $startPoint
        university: $university
        faculty: $faculty
      }
    ) {
      jwt
      user {
        id
        username
        email
      }
    }
  }
`;

export const CREATE_BOOKING = gql`
  mutation CreateBooking(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phone: String!
    $destination: String!
    $date: Date!
    $tripType: String!
    $tripCost: Float!
    $area: String!
    $startPoint: String!
    $startTime: String!
    $endTime: String!
    $seats: Int!
    $paymentType: String!
    $userId: ID!
    $publishedAt: DateTime!
  ) {
    createBooking(
      data: {
        first_name: $firstName
        last_name: $lastName
        email: $email
        phone: $phone
        destination: $destination
        date: $date
        trip_type: $tripType
        trip_cost: $tripCost
        area: $area
        start_point: $startPoint
        start_time: $startTime
        end_time: $endTime
        seats: $seats
        payment_type: $paymentType
        user_id: $userId
        publishedAt: $publishedAt
      }
    ) {
      data {
        id
        attributes {
          first_name
          date
          publishedAt
        }
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser(
    $id: ID!
    $firstName: String
    $lastName: String
    $phoneNumber: String
    $area: String
    $startPoint: String
    $university: String
    $faculty: String
  ) {
    updateUsersPermissionsUser(
      id: $id
      data: {
        first_name: $firstName
        last_name: $lastName
        phone_number: $phoneNumber
        area: $area
        start_point: $startPoint
        university: $university
        faculty: $faculty
      }
    ) {
      data {
        id
        attributes {
          username
          first_name
          last_name
        }
      }
    }
  }
`;

export const UPLOAD_PHOTO = gql`
  mutation UploadUserPhoto($file: Upload!, $userId: ID!) {
    upload(file: $file, ref: "plugin::users-permissions.user", refId: $userId, field: "photo") {
      data {
        id
        attributes {
          url
        }
      }
    }
  }
`;

export const CANCEL_BOOKING = gql`
  mutation UpdateBooking($id: ID!, $data: BookingInput!) {
    updateBooking(id: $id, data: $data) {
      data {
        id
        attributes {
          trip_status
        }
      }
    }
  }
`;

export const UPDATE_NOTIFICATION_READ = gql`
  mutation UpdateNotification($id: ID!) {
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
