import { PlaygroundConfig } from 'apollo-server-lambda';

export const playground: PlaygroundConfig = {
  settings: {
    'editor.cursorShape': 'line',
    'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
    'editor.fontSize': 14,
    'editor.reuseHeaders': true,
    'editor.theme': 'dark',
    'general.betaUpdates': false,
    'request.credentials': 'omit',
    'schema.polling.enable': true,
    'schema.polling.endpointFilter': '*localhost*',
    'schema.polling.interval': 60000,
    'schema.disableComments': false,
    'tracing.hideTracingResponse': true
  }
};
