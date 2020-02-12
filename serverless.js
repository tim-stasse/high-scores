/* eslint-disable @typescript-eslint/no-var-requires */
const { includes } = require('lodash/fp');

const dynamodbOfflinePort = 8000;

const isOffline = includes('offline')(process.argv);

const variables = {
  stage: '${self:provider.stage}'
};

const tables = {
  highScore: `high-score-${variables.stage}`
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const httpEvent = (method) => ({
  http: {
    method,
    path: 'graphql'
  }
});

module.exports = {
  service: {
    name: 'high-scores'
  },
  provider: {
    name: 'aws',
    region: "${opt:region, env:REGION, 'ap-southeast-2'}",
    runtime: 'nodejs12.x',
    stage: "${opt:stage, env:STAGE, 'development'}",
    environment: {
      DYNAMODB_OFFLINE_PORT: dynamodbOfflinePort,
      IS_OFFLINE: isOffline ? 'TRUE' : 'FALSE'
    }
  },
  package: {
    individually: true,
    exclude: ['node_modules/**'],
    excludeDevDependencies: true
  },
  plugins: [
    'serverless-webpack',
    'serverless-dynamodb-local',
    'serverless-offline'
  ],
  custom: {
    dynamodb: {
      seed: {
        highScores: {
          sources: [
            {
              table: tables.highScore,
              sources: ['seed-data/high-scores.json']
            }
          ]
        }
      },
      stages: ['development'],
      start: {
        migrate: true,
        port: dynamodbOfflinePort,
        seed: true
      }
    },
    'serverless-offline': {
      port: 4000
    },
    webpack: {
      webpackConfig: './webpack.config.js',
      packager: 'yarn'
    }
  },
  functions: {
    highScore: {
      handler: 'src/@services/high-score/index.handler',
      events: [httpEvent('GET'), httpEvent('POST')],
      environment: {
        HIGH_SCORE_TABLE: tables.highScore
      }
    }
  },
  resources: {
    Resources: {
      highScoreTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: tables.highScore,
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S'
            },
            {
              AttributeName: 'score',
              AttributeType: 'N'
            }
          ],
          BillingMode: 'PAY_PER_REQUEST',
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH'
            },
            {
              AttributeName: 'score',
              KeyType: 'RANGE'
            }
          ],
          PointInTimeRecoverySpecification: {
            PointInTimeRecoveryEnabled: true
          }
        }
      }
    }
  }
};
