
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuthStore } from './auth';

// API endpoint - using the correct server URL
const API_URL = 'https://backend.zainbus.com/graphql';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    if (networkError.message.includes('401')) {
      // Handle unauthorized error - log the user out
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
  }
});

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: API_URL,
  // Adding credentials to allow cookies to be sent with the request
  credentials: 'include',
});

// Auth link for adding the token to requests
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from the store
  const { token } = useAuthStore.getState();
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create Apollo client
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
