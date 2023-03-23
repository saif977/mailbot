const { google } = require("googleapis");
const path = require("path");
const helper = require("../helper");

const filePath=path.join(__dirname,"../","client.json");
const clientData=helper.getDataFromFile(filePath);
const clientId = clientData.client_id;
const clientSecret = clientData.client_secret;
const redirectUri = clientData.redirect_uris[0];

oauth2Client = new google.auth.OAuth2({
    clientId,
    clientSecret,
    redirectUri,
});

exports.getOauth2client=()=>oauth2Client;