# AlexaQ
Democratized music control!

A simple project that enables multiple users to add songs to a shared queue and vote on which songs will be played on an Amazon Alexa
using Spotify.

Created at [BlairHacks_2](https://twitter.com/blair_hacks) by [Hassan Syyid](https://github.com/hsyyid), [Andrei Freund](https://github.com/bugsythebean), and [Yusuf Bham](https://github.com/5FiftySix6). 

Awarded "Best Overall", "UX Polish", and "Best Hardware Hack"

## Usage

The user selects songs from the frontend (currently an iOS app) - the app is powered by the Spotify API. Once a user selects a
track, it is added to the queue. The app allows all users to view the current queue and upvote or downvote songs.

## Technology

This repository contains the backend for the project, which runs on Microsoft Azure functions and is written in NodeJS.
We used the Azure Cosmos DB and Spotify's API to interact with the Alexa indirectly.

Since interaction with the queued music with Spotify's API is somewhat limited, we queued music to a Spotify playlist created
on the user's Spotify account to control the music playing on the Alexa.

For the hackathon, we built a barebones iOS app using Swift to demo how the project could be used with multiple users.

## Links

* [Devpost Project](https://devpost.com/software/alexaq)
