const oauth2Client=require("./oauth2client").getOauth2client();
const gmailController=require("./gmailController");
require("dotenv").config();
const cron=require("../cron");

const {google}=require("googleapis");
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

exports.login = async (req, res, next) => {
    try {
        const SCOPES = process.env.SCOPES;
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: SCOPES,
        });
        res.redirect(authUrl);
    } catch (err) {
        console.log(err);
    }
};

exports.oauth2callback = async (req, res, next) => {
    try {
        const authCode = ({ code } = req.query);
        let { tokens } = await oauth2Client.getToken(authCode);
        oauth2Client.setCredentials(tokens);
            // generate auto response every 30 secs
        await cron.start(gmailController.sendAutoResponse,30000);     
        res.render("index",{
            cron,
            isBotRunning:true
        });
    } catch (err) {
        console.log(err);
    }
};

// exports.start=(req,res,next)=>{
//     cron.start(gmailController.sendAutoResponse,30000);
//     res.render("index",{
//         sendAutoResponse:gmailController.sendAutoResponse,
//         cron,
//     });
// }



exports.stop=async (req,res,next)=>{
    console.log("stopped",cron.isCronRunning());
    await cron.stop();
    res.render("index",{
        cron,
        isBotRunning:false
    });
}
