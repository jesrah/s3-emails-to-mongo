const AWS = require('aws-sdk');
const promisify = require('util').promisify;
const simpleParser = require('mailparser').simpleParser;
const {
    Mail,
    ConnectToMailbox,
    DisconnectFromMailbox
} = require('./MailModel.js');


const s3 = new AWS.S3();
s3.listObjects = promisify(s3.listObjects);
s3.getObject = promisify(s3.getObject);
s3.deleteObject = promisify(s3.deleteObject);
Mail.find = promisify(Mail.find);
// options for config
let bucketName = '';
let configSet = false;
let dbName = '';

const addDBRecord = (emailObj) => {
    return new Promise((fulfill, reject) => {
        if (configSet) {
            Mail.find({
                messageId: emailObj.messageId
            })
            .then((docs) => {
                if (!docs.length) {
                    const newMail = Mail(emailObj);
                    newMail.save = promisify(newMail.save);
                    newMail.save()
                    .then((data) => {
                        fulfill(emailObj);
                    })
                    .catch((err) => {
                        reject(err);
                    });
                }

            })
            .catch((err) => {
                reject(err);
            });
        }
        else {
             console.log('s3-emails-to-mongo config not run');
        }
    })
}

const config = (options) => {
    if (options.credentials === 'shared') {
        const credentials = new AWS.SharedIniFileCredentials({
            profile: 'default',
        });
        AWS.config.credentials = credentials;
    }
    bucketName = options.bucketName;
    dbName = options.database;
    configSet = true;
}

const getAllObjKeys = () => {
    return new Promise((fulfill, reject) => {
        s3.listObjects({
            Bucket: bucketName,
            MaxKeys: 1000,
        })
        .then((keysArr) => {
            fulfill(keysArr.Contents.map((val) => {
                return val.Key;
            }));
        })
        .catch((err) => {
            reject(err);
        });
    })
};

const getEmailFromKey = (key) => {
    return new Promise((fulfill, reject) => {
        s3.getObject({
            Bucket: bucketName,
            Key: key,
        })
        .then((email) => {
            email.AWSKey = key;
            fulfill(email);
        })
        .catch((err) => {
            reject(err);
        });
    });
};

const getNewMessages = (callback) => {
  if(!callback) {
    return new Promise((fulfill, reject) => {
        getAllObjKeys()
        .then(turnKeysIntoEmails)
        .then(parseEmailsToObjs)
        .then(saveToDB)
        .then((data) => {
            fulfill(data);
        })
        .catch((err) => {
            reject(err);
        })
    });
  }
  else if (typeof(callback) === 'function') {
    getAllObjKeys()
    .then(turnKeysIntoEmails)
    .then(parseEmailsToObjs)
    .then(saveToDB)
    .then((data) => {
        callback(data, null);
    })
    .catch((err) => {
      callback(null, err);
    })
  }
};

const getParsedEmailObj = (emailObj) => {
    return new Promise((fulfill, reject) => {
        simpleParser(emailObj.Body)
        .then((parsedEmail) => {
            fulfill({
                from: parsedEmail.headers.get('from').text,
                to: parsedEmail.headers.get('to').text,
                cc: parsedEmail.headers.get('cc'),
                bcc: parsedEmail.headers.get('bcc'),
                date: parsedEmail.headers.get('date'),
                subject: parsedEmail.headers.get('subject'),
                messageId: parsedEmail.messageId,
                inReplyTo: parsedEmail.headers.get('inReplyTo'),
                replyTo: parsedEmail.headers.get('replyTo'),
                references: parsedEmail.headers.get('references'),
                text: parsedEmail.text,
                attachments: parsedEmail.attachments,
                type: 'inbound',
                AWSKey: emailObj.AWSKey,
            })
        })
        .catch((err) => {
            reject(err);
        });
    });
};

const parseEmailsToObjs = (emails) => {
    return new Promise((fulfill, reject) => {
        return Promise.all(emails.map((email) => {
            return getParsedEmailObj(email);
        }))
        .then((parsedEmails) => {
            fulfill(parsedEmails);
        })
        .catch((err) => {
            reject(err);
        });
    });
};

const removeFromAWSBucket = (emailObjs) => {
    emailObjs.map((email) => {
        s3.deleteObject({
            Bucket: bucketName,
            Key: email.AWSKey,
        })
        .then((data) => {
            console.log('sucessfully deleted indexed email from AWS S3');
        })
        .catch((err) => {
            console.log('error deleting from s3:', err);
        });
    });
};

const saveToDB = (emailObjs) => {
    // delete from AWS here upon successful save
    return new Promise((fulfill, reject) => {
        Promise.all(emailObjs.map((email) => {
            ConnectToMailbox(dbName);
            return addDBRecord(email);
        }))
        .then((emails) => {
            DisconnectFromMailbox();
            removeFromAWSBucket(emailObjs);
            fulfill(emails);
        })
        .catch((err) => {
            DisconnectFromMailbox();
            reject(err);
        });
    })
};

const turnKeysIntoEmails = (objKeys) => {
    return new Promise((fulfill, reject) => {
        return Promise.all(objKeys.map((key) => {
            return getEmailFromKey(key);
        }))
        .then((emailObjs) => {
            fulfill(emailObjs);
        })
        .catch((err) => {
            reject(err);
        });
    });
};

module.exports = getNewMessages;
module.exports.config = config;
