/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const { subWeeks } = require('date-fns');
const { random, times } = require('lodash/fp');
const uuid = require('uuid/v4');

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const gamesPlayedSoFar = 500000;
const gamesPlayedPerWeek = 20000;

const now = new Date();

const records = times(
  (index) => ({
    id: 'high-score',
    score: random(1, 100000000),
    date: randomDate(
      subWeeks(now, index % (gamesPlayedSoFar / gamesPlayedPerWeek)),
      now
    ),
    playerId: uuid()
  }),
  gamesPlayedSoFar
);

console.log(JSON.stringify(records, null, 2));
