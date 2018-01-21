const getEmails = require('s3-emails');
const configure = require('./config');
const db = require('./db');

let config;

const processNewMail = function(optionalCallback) {
    if (config.Bucket === '') {
        throw new Error('Bucket name must be set!');
    }
    else {

        const results = getEmails({
            Bucket: config.Bucket,
            removeFromBucket: true,
        })
            .then(db.save);


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
    db.setDB(config.DB);
    db.setSchema(config.MailSchema);
    return config;
};

module.exports = processNewMail;
module.exports.configure = configureOptions;


// test code

configureOptions({
    Bucket: 'zhillb-mail'
});

processNewMail().then(console.log);
