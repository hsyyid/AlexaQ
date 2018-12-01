require('dotenv').config();
const spotify = require('./spotify');

module.exports = async function (context, req) {
    context.log(JSON.stringify(req, null, 2));
    let {func} = req.query;

    if (func === "Play") 
    {
        let devices = await spotify.GetDevices();
        let device_id = devices.filter(t => t.type === "Computer")[0].id;
        await spotify.Play(device_id, "spotify:user:xnjxjolo:playlist:0u86OgQ2FWCBRuQqf6pOxP");

        context.res = {
            status: 200
        };
    }
    else if (func === "Search")
    {
        let {term} = req.query;
        let results = await spotify.Search(term);

        context.res = {
            status: 200,
            body: JSON.stringify(results)
        };
    }
    else 
    {
        context.res = {
            status: 400,
            body: "Invalid function"
        };
    }
};