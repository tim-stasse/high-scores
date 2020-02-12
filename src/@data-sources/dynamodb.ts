/* eslint-disable @typescript-eslint/no-explicit-any */
import { createQueryFilter, KeyCondition, ListData } from '@common';
import { CursorsInput, Maybe } from '@schema/generated';
import { branch } from '@utils';
import { DataSource } from 'apollo-datasource';
import { DynamoDB } from 'aws-sdk';
import {
  constant,
  flow,
  first,
  isNil,
  keys,
  negate,
  pick,
  toPairs,
  fromPairs,
  filter
} from 'lodash/fp';

export type Options = DynamoDB.DocumentClient.DocumentClientOptions &
  DynamoDB.Types.ClientConfiguration;

export type QueryResult = ListData<Record<string, any>>;

export class DynamoDBDataSource extends DataSource {
  private client: DynamoDB.DocumentClient;
  private tableName: string;

  public constructor(tableName: string, options?: Options) {
    super();
    this.tableName = tableName;

    this.client = new DynamoDB.DocumentClient(options);
  }

  private scanForward = (
    sortAscending: boolean,
    cursors?: Maybe<CursorsInput>
  ): boolean => (sortAscending ? !cursors?.before : !!cursors?.before);

  protected query = (
    key: Record<string, KeyCondition | undefined>,
    sortAscending = true,
    cursors?: Maybe<CursorsInput>,
    limit?: number
  ): Promise<QueryResult> =>
    this.client
      .query({
        ...flow(
          toPairs,
          filter(([, value]) => !isNil(value)),
          fromPairs,
          createQueryFilter
        )(key),
        Limit: limit,
        TableName: this.tableName,
        ExclusiveStartKey: flow(
          branch(
            (_: boolean) => _,
            constant(cursors?.after ?? cursors?.before),
            constant(cursors?.before ?? cursors?.after)
          ),
          branch(
            negate(isNil),
            (_: string) => JSON.parse(_),
            constant(undefined)
          )
        )(sortAscending),
        ScanIndexForward: this.scanForward(sortAscending, cursors)
      })
      .promise()
      .then(({ Items, LastEvaluatedKey }) =>
        flow(
          (data: Record<string, any>[]) => ({ data }),
          ({ data }) => ({
            data,
            firstKey:
              data.length > 1
                ? flow(
                    (_: typeof data) => first(_),
                    pick(keys(key)),
                    (_) => JSON.stringify(_)
                  )(data)
                : null,
            lastKey: LastEvaluatedKey ? JSON.stringify(LastEvaluatedKey) : null
          }),
          ({ data, firstKey, lastKey }) => ({
            data,
            cursors: {
              forward: this.scanForward(sortAscending, cursors)
                ? firstKey
                : lastKey,
              backward: this.scanForward(sortAscending, cursors)
                ? lastKey
                : firstKey
            }
          })
        )(Items ?? [])
      );
}
