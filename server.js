#!/usr/bin/env node

var Twit = require('twit');
var probable = require('probable');
var canIChimeIn = require('can-i-chime-in')({
  extraWordsToAvoid: [
    'porn',
    'rt',
    'videos'
  ]
});

var lowercaseRegex = /romantic/g;
var uppercaseRegex = /Romantic/g;
var allcapsRegex = /ROMANTIC/g;
var detectionRegex = /romantic/i;

var lowercaseKeywordForm = 'necromantic';
var uppercaseKeywordForm = 'Necromantic';
var allcapsKeywordForm = 'NECROMANTIC';

var dryRun = true;

var twit = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET  
});
var streamOpts = {
  replies: 'none',
  track: 'romantic'
};

var stream;

function startStreaming() {
  console.log('Starting streaming.')
  stream = twit.stream('statuses/filter', streamOpts);
  stream.on('tweet', transformTweet);
  stream.on('error', handleStreamError);
}

function transformTweet(incomingTweet) {
  if (canIChimeIn(incomingTweet.text) && isNotAReply(incomingTweet) &&
     incomingTweet.text.match(detectionRegex)) {
    
    // Don't tweet too much.
    if (probable.roll(20) > 0) {
      return;
    }

    var transformedText = incomingTweet.text.replace(lowercaseRegex, lowercaseKeywordForm);
    transformedText = transformedText.replace(uppercaseRegex, uppercaseKeywordForm);
    transformedText = transformedText.replace(allcapsRegex, allcapsKeywordForm);
    transformedText = stripLinks(transformedText);

    var newTweet = {
      status: transformedText
    };

    if (process.env.VERBOSE === 'on') {
      console.log('posting:', newTweet.status);
    }
    if (process.env.DRY !== 'on') {
      twit.post('statuses/update', newTweet, handleError);
    }
  }
  else if (process.env.VERBOSE === 'on') {
    console.log('Not using:', incomingTweet.text);
  }
}


function handleError(error, data) {
  if (error) {
    logError(error);

    if (data) {
      console.log('Data associated with error:', data);
    }
  }
  else {
    console.log('Posted without error.');
  }
}

function logError(error) {
  console.log(error, error.stack);
}

function handleStreamError(error) {
  logError(error);
  stream.stop();
  startStreaming();
}

function stripLinks(s) {
  return s.replace(/https*:\/\/.*\b/g, '');
}

function isNotAReply(tweet) {
  // Can get fancier later.
  return tweet.text.charAt(0) !== '@';
}

startStreaming();
