require('dotenv').config()
const bluebird = require('bluebird');
const Twitter = require('twitter');
const moment = require('moment-timezone');

const twitterClient = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

function getWinners(numberOfWinners, hours, hashtag, ignoredAccounts = []) {
  const date = moment()
    .tz("Europe/London")
    .subtract(hours, "hours")
    .format('YYYY-MM-DD');

  return new bluebird((resolve, reject) => {
    twitterClient.get(
      'search/tweets',
      { q: `${hashtag} since:${date}` },
      function (error, tweets, response) {
        let entrants = tweets.statuses
          .map((tweet) => `@${tweet.user.screen_name}`)
          .filter((name) => {
            return ignoredAccounts
              .map((ignoredAccount) => ignoredAccount.toLowerCase())
              .indexOf(name.toLowerCase()) === -1;
          });

        const winners = [];
        for (let i = 0; i < numberOfWinners; i++) {
          const winner = entrants[Math.floor(Math.random()*entrants.length)];
          winners.push(winner);

          entrants = entrants.filter(entrant => entrant !== winner);
        }

        resolve(winners);
      }
    );
  })
}

getWinners(
  process.env.NUMBER_OF_WINNERS || 1,
  process.env.HOURS || 24,
  process.env.HASHTAG || '#juniorhub',
  [
    '@codefoodpixels',
    '@leedsjs',
    '@JuniorHubDev',
    '@NaomiSharif94',
    '@techyrey',
    '@matthew_inamdar',
  ])
  .then((winners) => {
    console.log(winners);
  });
