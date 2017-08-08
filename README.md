## What this module does
This simple module takes mail objects stored on AWS S3 from AWS SES and indexes them into your mongo database.
You have to pass in the AWS Bucketname, DB name, and setup your AWS shared authentication and you should be good to go!

## How to use
```javascript
const getNewMessages = require('s3-emails-to-mongo');

getNewMessages.config({
	credentials: 'shared',
	bucketName: 'unique-aws-bucket',
	database: 'your-mongodb',
});

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
