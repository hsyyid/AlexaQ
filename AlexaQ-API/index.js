require('dotenv').config();
const spotify = require('./spotify');

async function Play (position) {
    let devices = await spotify.GetDevices();
    let device_id = devices.filter(t => t.name === "Marko's Echo Dot")[0].id;
    let {uri} = await spotify.GetPlaylist("AlexaQ Playlist");

    await spotify.Play(device_id, uri, position);
}

module.exports = async function (context, req) {
    context.log(JSON.stringify(req, null, 2));
    let {func} = req.query;

    switch (func) {
        case "Play": {
            await Play();

            context.res = {
                status: 200
            };

            break;
        }
        case "Search": {
            let {term} = req.query;
            let results = await spotify.Search(term);

            context.res = {
                status: 200,
                body: JSON.stringify(results)
            };

            break;
        }
        case "Add": {
            let {uris} = req.body;
            await spotify.AddSongsToPlaylist(uris);
            let currently_playing = await spotify.GetCurrentlyPlaying();

            // If it's not playing, play it
            if (!(currently_playing && currently_playing.is_playing && currently_playing.device && currently_playing.device.name === "Marko's Echo Dot")) {
                let tracks = await spotify.GetPlaylistTracks();
                let position = tracks.findIndex(t => t.uri === uris[0]);
                console.log("Index: " + position);

                await Play(position);
            }

            context.res = {
                status: 200
            };

            break;
        }
        default: {
            context.res = {
                status: 400,
                body: "Invalid function"
            };

            break;
        }
    }
};