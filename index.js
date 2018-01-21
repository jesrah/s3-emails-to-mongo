const bucket = require('./bucket');
const configure = require('./config');
const db = require('./db');
const parse = require('./parseMail');

let config;

const processNewMail = function(optionalCallback) {
    if (config.Bucket === '') {
        throw new Error('Bucket name must be set!');
    }
    else {

        const results = bucket.getKeys()
            .then(bucket.getEmailsFromKeys)
            .then(parse)
            .then(db.save)
            .then(bucket.removeFromBucket);


        // process with promise
        if (!optionalCallback) {
            return results;
        }
        
        // process with callback
        else {
            results.then((data) => {
                optionalCallback(null, data);
            }).catch((err) => {
                optionalCallback(err, null);
            });
        }
    }
};

const configureOptions = function(options) {
    config = configure(options);
    bucket.setName(config.Bucket);
    db.setDB(config.DB);
    db.setSchema(config.MailSchema);
    return config;
};

module.exports = processNewMail;
module.exports.configure = configureOptions;
