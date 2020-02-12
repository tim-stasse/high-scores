const getEnv = (key: string, defaultValue = ''): string =>
  process.env[key] ?? defaultValue;

export const dynamodbOfflineHost = getEnv('DYNAMODB_OFFLINE_HOST', 'localhost');
export const dynamodbOfflinePort = getEnv('DYNAMODB_OFFLINE_PORT');
export const highScoreTable = getEnv('HIGH_SCORE_TABLE');
export const isOffline = /true/i.test(getEnv('IS_OFFLINE'));
