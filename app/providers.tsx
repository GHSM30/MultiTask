'use client';

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ReactNode } from 'react';

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

const authLink = setContext((_, { headers }) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  }
  return { headers };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}