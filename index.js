const utils = require('./utils');
const express = require('express');

const app = express();

app.get('/youtube', async function(req, res) {
    let songPath = await utils.handleYoutubeRequest(req.query.v);

    if (songPath) {
        res.sendFile(songPath, {acceptRanges: false, root: __dirname});
    }
});

app.listen(3000);