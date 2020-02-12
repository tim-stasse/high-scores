import { isoDate, pagination } from '@schema/modules';
import { makeExecutableSchema } from 'graphql-tools';
import * as resolvers from './resolvers';
import typeDefs from './type-defs.gql';

export const schema = makeExecutableSchema({
  typeDefs: [isoDate.typeDefs, pagination.typeDefs, typeDefs],
  resolvers: {
    ...isoDate.resolvers,
    ...resolvers
  }
});
