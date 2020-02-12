import { playground } from '@constants';
import { ApolloServer } from 'apollo-server-lambda';
import { dataSources } from './data-sources';
import { schema } from './schema';

export const server = new ApolloServer({
  dataSources,
  schema,
  playground
});

export const handler = server.createHandler();
