const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let dbName;

const connect = function() {
    const mongoURI = 'mongodb://localhost/' + dbName;
    const options = {
        useMongoClient: true,
    };
    return mongoose.connect(mongoURI, options);
};

/*
** checks if document exists in db with the messageId
** that gets passed in. returns a boolean value
*/
const checkIfMailIsStored = function(messageId) {
    const Mail = mongoose.model('Mail');
    return Mail.find({ messageId: messageId }).exec()
        .then((document) => {
            if (document.length) return true;
            else return false;
        });
};

/*
** checks if array has a length, returns boolean
** based on if the value is greater than 0
*/
const checkIfNewMail = function(emails) {
    if (!emails.length) {
        return false;
    } else {
        return true;
    }
};

const disconnect = function() {
    mongoose.connection.close();
};

module.exports = {
    save: function(emails) {
        if (!checkIfNewMail(emails)) {
            return [];
        }
        else {
            return connect().then(() => {
                const Mail = mongoose.model('Mail');
                const addedEmails = emails.map((email) => {
                    return checkIfMailIsStored().then((alreadyExists) => {
                        if (!alreadyExists) {
                            const newMail = new Mail(email);
                            return newMail.save();
                        }
                        else throw new Error(
                            'fatal error: document already exists in database'
                        );
                    });
                });
                return Promise.all(addedEmails).then(() => {
                    disconnect();
                    return emails;
                });
            });
        }
    },

    setDB: function(name) {
        dbName = name;
    },

    setSchema: function(Schema) {
        const mailSchema = mongoose.Schema(Schema);
        mongoose.model('Mail', mailSchema);
    },
};