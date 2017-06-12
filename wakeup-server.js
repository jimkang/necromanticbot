var request = require('request');
var express = require('express');
var app = express();

app.get("/", (_req, res) => {
  res.status(200).send('Still up!');
});


setInterval(ping, 1 * 60 * 1000);

function ping() {
  request('https://necromanticbot.glitch.me/').pipe(process.stdout);
}

module.exports = app;
