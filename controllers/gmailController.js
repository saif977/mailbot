const oauth2Client = require("./oauth2client").getOauth2client();
const { google } = require("googleapis");
const gmail = google.gmail({ version: "v1", auth: oauth2Client });
require("dotenv").config();

const getAllUnreadEmails = async () => {
    try {
        const resMessages = await gmail.users.messages.list({
            userId: "me",
            labelIds: "UNREAD",
        });
        return resMessages?.data?.messages;
    } catch (err) {
        console.log(err);
    }
};

// ============ funtion to create label =====================

// const createLabel = async (labelId, labelName) => {
//     try {
//         console.log(labelId,labelName,"test")
//         const labelObj = {
//             id: 'my-label-id',
//             labelListVisibility: 'labelShow',
//             messageListVisibility: 'show',
//             name: 'My Label Name',
//           };

//         const newLabel = await gmail.users.labels.create({
//             userId: "me",
//             resource: labelObj,
//         });
//         console.log(newLabel);
//         return newLabel;
//     } catch (err) {
//        // if(err.code===404)
//         console.log(err,"new lab err");
//     }
// };

//======================================================================

const isUnrepliedEmail = async (email, automatedReplyLabelId) => {
    try {
        const threadData = await gmail.users.threads.get({
            userId: "me",
            id: email.threadId,
        });
        const automatedReplyLabelExists = threadData.data.messages[0].labelIds.includes(
            automatedReplyLabelId
        );
        if (automatedReplyLabelExists) return false;

        const emailData = await gmail.users.messages.get({
            userId: "me",
            id: email.id,
        });
        return emailData;
    } catch (err) {
        console.log(err);
    }
};

const addLabelToGivenThread = async (threadId, labelId) => {
    try {
        const modifyReq = {
            addLabelIds: [labelId],
        };
        await gmail.users.threads.modify({
            userId: "me",
            id: threadId,
            resource: modifyReq,
        });
    } catch (err) {
        console.log(err);
    }
};

const createAndSendEmail = async (emailData,automatedReplyLabelId) => {
    try {
        const headers = emailData.data.payload.headers;
        const to = headers.find((obj) => obj.name.toLowerCase() === "to").value;
        const from = headers.find(
            (obj) => obj.name.toLowerCase() === "from"
        ).value;
        const threadId = emailData.data.threadId;
        const mssgId = emailData.data.id;
        const subject = "Dont Reply, Auto Response";

        const replyMessage = [
            `From: ${to}`,
            `To: ${from}`,
            `Subject: Re: ${subject}`,
            `In-Reply-To: ${mssgId}`,
            `References: ${threadId}`,
            "Content-Type: text/html; charset=utf-8",
            "",
            "Hello,",
            `<p>This is an automated generated message!!</p>`,
            `<p>Used just for testing. Dont reply back.</p>`,
            "<p>Thanks.</p>",
            "",
            "<p>Best regards,</p>",
            "<p>ALIEN</p>",
        ].join("\n");

        const replyMssgEncoded = Buffer.from(replyMessage).toString("base64");
        const replyMssgRaw = replyMssgEncoded
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        const replyMssgObj = {
            threadId,
            raw: replyMssgRaw,
        };

        await gmail.users.messages.send({
            userId: "me",
            resource: replyMssgObj,
        });

        await addLabelToGivenThread(threadId, automatedReplyLabelId);
    } catch (err) {
        console.log(err);
    }
};

exports.sendAutoResponse = async () => {
    try {
        const unreadEmails = await getAllUnreadEmails();
        const automatedReplyLabelId = process.env.automatedReplyLabelId;
        const automatedReplyLabel = await gmail.users.labels.get({
            userId: "me",
            id: automatedReplyLabelId,
        });
        console.log(automatedReplyLabel.data,"data");
        const threadIdCache = {};
        for (const email of unreadEmails) {
            if (threadIdCache.hasOwnProperty(email.threadId)) continue;
            const unrepliedEmailData = await isUnrepliedEmail(
                email,
                automatedReplyLabelId
            );
            if (unrepliedEmailData) {
                await createAndSendEmail(
                    unrepliedEmailData,
                    automatedReplyLabelId
                );
            }
            threadIdCache[email.threadId] = 1;
        }
    } catch (err) {
        if (err.code === 404) {
            console.log("label does not exist");
        }
        console.log(err, "err");
    }
};
