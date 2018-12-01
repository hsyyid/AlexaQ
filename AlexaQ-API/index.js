const spotify = require('./spotify');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.query.name || (req.body && req.body.name)) {
        let devices = await spotify.GetDevices();

        context.res = {
            status: 200,
            body: (JSON.stringify(devices, null, 2))
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
};