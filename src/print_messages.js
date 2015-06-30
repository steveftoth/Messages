var m = require('./messages.js');

var _ = require('lodash');
m.dbInfo(process.argv[2]).then(function(chats){

    //console.log('done ' + JSON.stringify(chats));
    //console.log(JSON.stringify(chats));
    //console.log(chats);
    _.forEach(chats, function(chat){
        console.log([chat.ROWID]);
       //console.log(JSON.stringify(chat, null, 4));
        if(chat.messages) {
            _.forEach(chat.messages, function (message) {
                console.log([message.ROWID, message.text]);
                if (message.attachments && messages.attachments.length > 0) {
                    console.log(message.attachments.length);
                //    console.log(JSON.stringify(messages.attachments, null, 4));
                }
            });
        }
    });

});