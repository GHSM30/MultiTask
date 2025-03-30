import { ApolloServer } from 'apollo-server-micro';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '@/lib/graphql/typeDefs';
import { resolvers } from '@/lib/graphql/resolvers';
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';

const schema = makeExecutableSchema({ 
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  context: async ({ req }) => {
    await dbConnect();
    return { req };
  },
  formatError: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    };
  }
});

const startServer = apolloServer.start();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }

  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};