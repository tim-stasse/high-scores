import { HighScoreList, QueryResolvers } from './types.generated';

export const Query: QueryResolvers = {
  highScores: async (
    _,
    { cursors, limit },
    { dataSources }
  ): Promise<HighScoreList> =>
    dataSources.highScores.list(cursors, limit ?? undefined)
};
