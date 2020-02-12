import { DynamoDB } from 'aws-sdk';
import {
  camelCase,
  filter,
  flow,
  fromPairs,
  join,
  map,
  reduce,
  split,
  toPairs,
  uniq
} from 'lodash/fp';

export type QueryFilterAttributes = {
  KeyConditionExpression: DynamoDB.DocumentClient.QueryInput['KeyConditionExpression'];
  ExpressionAttributeNames: DynamoDB.DocumentClient.ScanInput['ExpressionAttributeNames'];
  ExpressionAttributeValues: DynamoDB.DocumentClient.ScanInput['ExpressionAttributeValues'];
};

export type LogicalOperator = 'AND' | 'OR';

export type FilterAttributesReducer = (
  queryFilterAttributes: QueryFilterAttributes[]
) => QueryFilterAttributes;

export const reduceFilterAttributes = (
  logicalOperator: LogicalOperator
): FilterAttributesReducer =>
  reduce<QueryFilterAttributes, QueryFilterAttributes>(
    (accumulator, value): QueryFilterAttributes => ({
      ExpressionAttributeNames: {
        ...accumulator.ExpressionAttributeNames,
        ...value.ExpressionAttributeNames
      },
      ExpressionAttributeValues: {
        ...accumulator.ExpressionAttributeValues,
        ...value.ExpressionAttributeValues
      },
      KeyConditionExpression: accumulator.KeyConditionExpression
        ? `${accumulator.KeyConditionExpression} ${logicalOperator} ${value.KeyConditionExpression}`
        : value.KeyConditionExpression
    }),
    {
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      KeyConditionExpression: ''
    }
  );

export type ConditionalOperator = '=' | '<>' | '<' | '<=' | '>' | '>=';

export type KeyCondition = {
  condition?: ConditionalOperator;
  value: string | number;
};

export type QueryFilter = (
  keyConditions: Record<string, KeyCondition>
) => QueryFilterAttributes;

export const createQueryFilter = (
  key: Record<string, KeyCondition>
): QueryFilterAttributes =>
  flow(
    (_: Record<string, KeyCondition>) => toPairs(_),
    filter((pair) => pair[1] !== undefined),
    map(
      flow(
        ([key, keyCondition]) => ({
          attributes: split('.')(key),
          key: camelCase(key),
          keyCondition
        }),
        ({ attributes, key, keyCondition }) => ({
          ExpressionAttributeNames: flow(
            (_: string[]) => uniq(_),
            map((attribute: string): [string, string] => [
              `#${attribute}`,
              attribute
            ]),
            (_) => fromPairs(_)
          )(attributes),
          ExpressionAttributeValues: {
            [`:${key}`]: keyCondition.value
          },
          KeyConditionExpression: flow(
            map((attribute): string => `#${attribute}`),
            join('.'),
            (path): string => `${path} ${keyCondition.condition ?? '='} :${key}`
          )(attributes)
        })
      )
    ),
    reduceFilterAttributes('AND')
  )(key);
