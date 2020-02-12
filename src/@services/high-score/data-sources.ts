import { DynamoDBDataSource, Options } from '@data-sources/dynamodb';
import {
  dynamodbOfflineHost,
  dynamodbOfflinePort,
  isOffline,
  highScoreTable
} from '@constants';
import { CursorsInput, Maybe } from '@schema/generated';
import { HighScore, HighScoreList } from './types.generated';

export class HighScoreDataSource extends DynamoDBDataSource {
  constructor(options?: Options) {
    super(highScoreTable, options);
  }

  public list = async (
    cursors?: Maybe<CursorsInput>,
    limit?: number
  ): Promise<HighScoreList> =>
    this.query(
      { id: { value: 'high-score' }, score: undefined },
      false,
      cursors,
      limit
    ).then(({ data, cursors }) => ({
      data: data as HighScore[],
      cursors
    }));
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const dataSources = () => ({
  highScores: new HighScoreDataSource(
    isOffline
      ? {
          region: 'localhost',
          endpoint: `http://${dynamodbOfflineHost}:${dynamodbOfflinePort}`
        }
      : undefined
  )
});

export type DataSources = ReturnType<typeof dataSources>;
