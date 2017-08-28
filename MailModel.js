const mongoose = require('mongoose');

const mailSchema = mongoose.Schema({
    from: String,
    to: String,
    cc: String,
    bcc: String,
    date: Date,
    messageId: String,
    subject: String,
    inReplyTo: String,
    replyTo: String,
    references: String,
    text: String,
    attachments: Array,
    type: String,
    unread: {
        type: Boolean,
        default: true,
    },
});

const Mail = mongoose.model('Mail', mailSchema);

const connect = (dbName) => {
    mongoose.connect('mongodb://localhost/' + dbName, {
        useMongoClient: true,
    });
}

const disconnect = () => {
    mongoose.connection.close();
}

module.exports = {
    ConnectToMailbox: connect,
    DisconnectFromMailbox: disconnect,
    Mail: Mail,
}
