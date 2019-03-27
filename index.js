const utils = require('./utils');
const express = require('express');

const app = express();

app.get('/youtube/getsong.php', async function(req, res) {
    if (!req.query.url) {
        res.send("Hey! Creo que te olvidaste la url :(");
    }
    let songPath = await utils.handleYoutubeRequest(req.query.url);

    if (songPath) {
        res.sendFile(songPath, {acceptRanges: false, root: __dirname});
    } else {
        res.send("Ups! La url que nos pasaste no es valida o no la podemos descargar :(");
    }
});

app.listen(3000);