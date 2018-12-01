const fetch = require("node-fetch");

const {urlEncode} = require("../util.js");

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

// For testing purposes
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

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
    body: urlEncode({refresh_token: refreshToken, grant_type: "refresh_token"})
  });

  let json = await response.json();

  return json.access_token;
};

/**
* Gets users playlists
*/
const GetPlaylists = async (identityId) => {
  let accessToken = await RefreshToken(identityId);

  let {id} = await GetUserProfile(accessToken);
  let playlists = await GetList("https://api.spotify.com/v1/me/playlists?limit=50", {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  return playlists.filter(p => p.owner.id === id);
};

/**
* Search Spotify
* TODO: Queries seem iffy, sometimes using * is better, sometimes quotes, sometimes nothing... need to investigate further
* TODO: Make it only search songs
*/
const Search = async (identityId, term, type, limit, offset) => {
  let accessToken = await RefreshToken(identityId);
  let url = `https://api.spotify.com/v1/search?q=${term.toLowerCase()}*&type=${type}&limit=${limit}${offset
    ? "&offset=" + offset
    : ""}`;

  let response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  let data = await response.json();
  return data[type + "s"].items;
};

/**
* Get playlist tracks
*/
const GetPlaylistTracks = async (id, accessToken, identityId) => {
  if (!accessToken)
    accessToken = await RefreshToken(identityId);

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
* Creates a new playlist
*/
const CreatePlaylist = async (name) => {
  let accessToken = await RefreshToken();
  let {display_name, id} = await GetUserProfile(accessToken);

  let response = await fetch(`https://api.spotify.com/v1/users/${id}/playlists`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name,
      description: `A custom playlist made for ${display_name || id}`,
      public: false
    })
  });

  let data = await response.json();
  console.log(JSON.stringify(data, null, 2));

  return data;
};

/**
* Adds specified songs to the playlist
*/
const AddSongsToPlaylist = async (id, uris) => {
  let accessToken = await RefreshToken();
  let response = await fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({uris})
  });

  console.log("Result: [" + JSON.stringify(await response.json()) + "]");
};

const GetDevices = async () => {
    let accessToken = await RefreshToken();
  
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

module.exports = {
  RefreshToken,
  CreatePlaylist,
  GetPlaylists,
  AddSongsToPlaylist,
  GetPlaylistTracks,
  Search,
  GetUserProfile,
  GetDevices
};
