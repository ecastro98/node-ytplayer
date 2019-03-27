const getYoutubeID = require('get-youtube-id');
const fs = require('fs');
const youtubedl = require('@microlink/youtube-dl');
const axios = require('axios');
const downloadingNow = [];

const handleYoutubeRequest = async (url) =>
{
    let youtubeId = getYoutubeID(url);

    if (!youtubeId) {
        return null;
    }
    
    if (downloadingNow.includes(youtubeId)) {
        await sleep(5000);
    } else if (!doesYoutubeFileExists(youtubeId)) {
        try {
            if (!(await downloadYoutubeFile(youtubeId))) {
                throw Error;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    return getYoutubeFilePath(youtubeId);
}

const doesYoutubeFileExists = (id) =>
{
    let file = getYoutubeFilePath(id);

    return fs.existsSync(file);
}

const getYoutubeFilePath = (id) => 
{
    return `./audio/${id}.mp3`;
}

const downloadYoutubeFile = async (id) =>
{
    downloadingNow.push(id);
    let url = 'https://www.youtube.com/watch?v=' + id;
    let response = await axios.get("https://www.googleapis.com/youtube/v3/videos?id=" + id +"&part=contentDetails&fields=items%2FcontentDetails%2Fduration&key=AIzaSyCnD6RM7P_azbsDvAQKSAri4py95554VsU");
    let durationSeconds = convert_time(response.data.items[0].contentDetails.duration);

    if (durationSeconds > 60*20) {
        throw Error;
    }

    return new Promise(
        (resolve, reject) =>
        {
            youtubedl.exec(
                url,
                ['-o', "audio/%(id)s.%(ext)s", '-x', '--audio-format', 'mp3', '--audio-quality', '9'],
                {},
                (err) => {
                    if (err) reject(false);
                    else {
                        let index = downloadingNow.indexOf(id);
                        downloadingNow.splice(index, 1);
                        resolve(true);
                    }
                }
            )
        }
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function convert_time(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
}

module.exports = { handleYoutubeRequest };