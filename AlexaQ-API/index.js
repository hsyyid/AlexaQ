require("dotenv").config();
const spotify = require("./spotify");

async function Play(position) {
  let devices = await spotify.GetDevices();
  let device_id = devices.filter(t => t.name === "Marko's Echo Dot")[0].id;
  let { uri } = await spotify.GetPlaylist("AlexaQ Playlist");

  await spotify.Play(device_id, uri, position);
}

async function IsPlaying() {
  let playlistUri = "spotify:user:hassansyyid:playlist:3ZXanQy95J6LIUDKve0XRZ";
  let currently_playing = await spotify.GetCurrentlyPlaying();

  return (
    currently_playing &&
    currently_playing.is_playing &&
    currently_playing.device &&
    currently_playing.device.name === "Marko's Echo Dot" &&
    currently_playing.context &&
    currently_playing.context.type &&
    currently_playing.context.type === "playlist" &&
    currently_playing.context.uri === playlistUri
  );
}

module.exports = async function(context, req) {
  context.log(JSON.stringify(req, null, 2));
  let { func } = req.query;

  switch (func) {
    case "Play": {
      await Play();

      context.res = {
        status: 200
      };

      break;
    }
    case "Search": {
      let { term } = req.query;
      let results = await spotify.Search(term);

      context.res = {
        status: 200,
        body: JSON.stringify(results)
      };

      break;
    }
    case "Add": {
      let { uris } = req.body;
      await spotify.AddSongsToPlaylist(uris);
      let isPlaying = await IsPlaying();

      // If it's not playing, play it
      if (!isPlaying) {
        let tracks = await spotify.GetPlaylistTracks();
        let position = tracks.findIndex(t => t.uri === uris[0]);

        await Play(position);
      }

      context.res = {
        status: 200
      };

      break;
    }
    case "db": {
      try {
        await db.helloCosmos();
      } catch (e) {
        console.log("EEEEEE");
        console.log(e);
      }
      break;
    }
    case "Queue": {
      let isPlaying = await IsPlaying();

      if (isPlaying) {
        let tracks = await spotify.GetPlaylistTracks();
        let curr_track = await spotify.GetCurrentTrack();
        let position = tracks.findIndex(t => t.uri === curr_track.uri);
        console.log("Pos: " + position);

        context.res = {
          status: 200,
          body: JSON.stringify({
            curr_track,
            tracks: tracks.slice(position)
          })
        };
      } else {
        context.res = {
          status: 400,
          body: JSON.stringify({
            error: "Not playing!"
          })
        };
      }

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
