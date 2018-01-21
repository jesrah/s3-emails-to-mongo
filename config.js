const defaults = {
    Bucket: '',
    DB: 'Mail',
    Save: {
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
    },
};


const makeSchema = function(schemaItemsToKeep) {
    const mailSchema = {
        headers: Object,
        subject: String,
        from: Object,
        to: Object,
        cc: Object,
        bcc: Object,
        date: Object,
        messageId: String,
        inReplyTo: String,
        'reply-to': String,
        references: Array,
        html: String,
        text: String,
        textAsHtml: String,
        attachments: Array,
    };

    let finalSchema = {};

    for (let field in mailSchema) {
        if (schemaItemsToKeep[field]) {
            finalSchema[field] = mailSchema[field];
        }
    }

    return finalSchema;
}


const mergeOptions = function(options) {

    let mergedOptions = { 
        ...defaults
    };

    Object.keys(options).forEach((option) => {
        if (typeof options[option] === 'string') {
            mergedOptions[option] = options[option];
        }
        else if (typeof options[option] === 'object') {
            Object.assign(mergedOptions[option], defaults[option], options[option]);
        }
    });

    return mergedOptions;

};

module.exports = function(options) {
    const newOptions = mergeOptions(options);
    const schema = makeSchema(newOptions.Save);
    delete newOptions.Save;
    return {
        ...newOptions,
        MailSchema: schema,
    }
};