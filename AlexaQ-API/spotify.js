const fetch = require("node-fetch");
const delay = require('delay');
const { urlEncode } = require("./util.js");

// const clientId = process.env.SPOTIFY_CLIENT_ID;
// const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
// const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
// const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const clientId = "***REMOVED***";
const clientSecret = "***REMOVED***";
const redirect_uri = "***REMOVED***";
const refresh_token = "***REMOVED***";

/**
* Gets a new access token to make requests
*/
const RefreshToken = async () => {
    let response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Basic ' + new Buffer(`${clientId}:${clientSecret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncode({ refresh_token, grant_type: "refresh_token" })
    });

    let json = await response.json();
    console.log(JSON.stringify(json));

    return json.access_token;
};

/**
* Gets users playlist
*/
const GetPlaylist = async (name) => {
    let accessToken = await RefreshToken();

    let { id } = await GetUserProfile(accessToken);
    let playlists = await GetList("https://api.spotify.com/v1/me/playlists?limit=50", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    console.log("Playlists: " + JSON.stringify(playlists));

    return playlists.filter(p => p.owner.id === id && p.name === name)[0];
};

/**
* Search Spotify
* TODO: Queries seem iffy, sometimes using * is better, sometimes quotes, sometimes nothing... need to investigate further
*/
const Search = async (term) => {
    let accessToken = await RefreshToken();
    let url = `https://api.spotify.com/v1/search?q=${term.toLowerCase()}*&type=track`;

    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    let data = await response.json();
    return data.tracks.items;
};

/**
* Get playlist tracks
*/
const GetPlaylistTracks = async () => {
    let { id } = await GetPlaylist("AlexaQ Playlist");
    let accessToken = await RefreshToken();

    let tracks = await GetList(`https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    return tracks.map(t => t.track);
};

/**
* Gets current users profile
*/
const GetUserProfile = async (accessToken) => {
    let response = await fetch(`https://api.spotify.com/v1/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    return await response.json();
}

/**
* Adds specified songs to the playlist
*/
const AddSongsToPlaylist = async (uris) => {
    let accessToken = await RefreshToken();
    let { id } = await GetPlaylist("AlexaQ Playlist");

    let response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris })
    });

    console.log("Result: [" + JSON.stringify(await response.json()) + "]");
};

const GetDevices = async () => {
    let accessToken = await RefreshToken();
    console.log("AccessToken: " + accessToken);

    let response = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    let data = await response.json();
    console.log(JSON.stringify(data, null, 2));

    if (data.devices) {
        return data.devices;
    } else {
        return undefined;
    }
};

const Play = async (device_id, playlist_uri, position) => {
    let accessToken = await RefreshToken();

    let response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            context_uri: playlist_uri,
            offset: position ? {
                position
            } : undefined
        })
    });

    console.log(response.status);
};

const GetList = async (base_url, params) => {
    let list = [];
    let next = base_url;

    do {
        try {
            let response = await fetch(next, params);

            if (response.status === 200) {
                let data = await response.json();

                if (data && data.items && data.items.length > 0) {
                    list.push.apply(list, data.items);
                    next = data.next;
                    console.log(list.length + " / " + data.total);
                }
            } else if (response.status === 429 && response.headers.has("retry-after")) {
                let retryDelay = parseInt(response.headers.get("retry-after"));
                console.log(`Retrying after ${retryDelay} seconds...`);
                // Delay is returned in seconds, we need it in millisec
                await delay(retryDelay * 1000);
            }
        } catch (err) {
            console.log("Error!!!");
            console.error(err);

            if (err && err.message) {
                console.log("Error message: " + err.message);
            }
        }
    } while (next);

    return list;
};

const GetCurrentlyPlaying = async (name) => {
    let accessToken = await RefreshToken();

    let response = await fetch("https://api.spotify.com/v1/me/player", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    return await response.json();
};

const GetCurrentTrack = async () => {
    let accessToken = await RefreshToken();

    let response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    let data = await response.json();
    return data.item;
};

module.exports = {
    RefreshToken,
    GetPlaylist,
    AddSongsToPlaylist,
    GetPlaylistTracks,
    Search,
    GetUserProfile,
    GetDevices,
    Play,
    GetCurrentlyPlaying,
    GetCurrentTrack
};
