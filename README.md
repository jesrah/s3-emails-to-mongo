## What this module does
This simple module takes mail objects stored on AWS S3 from AWS SES and indexes them into your mongo database.
You have to pass in the AWS Bucketname as described below and setup your AWS shared authentication and you should be good to go!

## How to use

In order to use this module, you must have AWS shared credential set up on your computer. You must pass in a configuration object to the configure method with a property called "Bucket" with your unique AWS bucket name. You can also choose to overwrite other options in the configuration (more on that below).

```javascript
const getNewMessages = require('s3-emails-to-mongo');

getNewMessages.configure({
  Bucket: 'unique-aws-bucket',
});
```

### Consuming with a promise example:

```javascript
getNewMessages()
.then((messages) => {
	if (!messages.length) {
		console.log('no new messages!');
	}
	else {
		console.log('new messages added to DB!\n\n', messages);
	}
})
.catch((err) => {
	console.log(err);
});
```

### Callback Example

```javascript
getNewMessages((messages, err) => {
  if (!err) {
  	if (!messages.length) {
      console.log('no new messages!');
    }
    else {
      console.log('new messages added to DB!\n\n', messages);
    }
  } else {
    console.log('err', err);
  }
});
```


### Overwriting Configuration Options

This is the default configuration:

```javascript
{
    Bucket: '',
    DB: 'Mail',
    MailSchema: {
        headers: false,
        subject: true,
        from: true,
        to: true,
        cc: true,
        bcc: true,
        date: true,
        messageId: true,
        inReplyTo: true,
        'reply-to': true,
        references: false,
        html: false,
        text: true,
        textAsHtml: false,
        attachments: true,
        read: true,
    }
}
``` 

You can overwrite any of the above values as long as you give it the same data type it was originally set to. For example, if you wanted to save the `html` value but not save the `text` you could do this:

```javascript
getNewMessages.configure({
  Bucket: 'unique-aws-bucket',
  MailSchema: {
    html: true,
    text: false,
  }
});
```
