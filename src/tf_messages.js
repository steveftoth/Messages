var _ = require('lodash');

var m = require('./manifest.js');

var messages = require('./messages.js');

var fse = require('fs-extra');


var backupDir = process.argv[2];
//console.error(backupDir);

var targetDir = process.argv[3];

var grepString = 'Library/SMS';
var smsData = {};

function writeChat(chat) {
    writeObjectToFile(targetDir + '/chats/' + chat.ROWID + '.json',chat);
}

function writeObjectToFile(file, obj) {
    fse.outputJsonSync(file,obj);
}


function calcPath(attachment) {
    return 'data/resource/' + _.last(attachment.filename.split('/'));
}

m.readBackupDatabase(backupDir + '/' + 'Manifest.mbdb',function(record) {
    if(record == null) {
        var dbPath = backupDir + '/' + smsData['Library/SMS/sms.db'].sha;

        messages.dbInfo(dbPath).then(function(chats){
            _.each(chats,function(chat){
                if(chat.messages)
                    chat.messages.sort(function(a,b){
                        return a.date - b.date;
                    });
            });

            // base/resource -> files referenced from message attachments
            // base/chats/<<id>>.json
            // base/chats.json -> chat ids
            var ids = _.map(chats,function(chat){
                return { id: chat.ROWID ,
                    chat_identifier: chat.chat_identifier,
                    handles: chat.handles,
                    startDate: messages.toDateFromCFDate(_.head(chat.messages).date),
                    endDate: messages.toDateFromCFDate(_.last(chat.messages).date),
                    count: (
                        function(){if(chat.messages)
                            return chat.messages.length;
                        else
                            return 0;})()
                };
            });
            writeObjectToFile(targetDir + '/chats.json',ids);
            _.each(chats,function(chat){

                if(chat.messages) {
                    chat.messages = _.map(chat.messages, function (message) {
                        if (message.attachments) {
                            message.attachments = _.map(message.attachments, function (attachment) {
                                var fullFilename = attachment['filename'];
                                if(fullFilename) {
                                    if (fullFilename.indexOf('~/') == 0) {
                                        fullFilename = fullFilename.slice('~/'.length);
                                    }
                                    if (fullFilename.indexOf('/var/mobile/') == 0) {
                                        fullFilename = fullFilename.slice('/var/mobile/'.length);
                                    }
                                    if (smsData[fullFilename]) {
                                        attachment['sha'] = smsData[fullFilename]['sha'];
                                        var filename = fullFilename.split('/');
                                        if (filename && filename.length > 1) {
                                            filename = filename[filename.length - 1];
                                        }
                                        //console.log('cp "' + backupDir + '/' + attachment['sha'] + '" ' + targetDir + '/' + filename);
                                        fse.copySync(backupDir+'/'+attachment['sha'], targetDir+'/resource/'+filename);

                                    } else {
                                        console.error("Can't find attachment in backup for " + fullFilename + ' ' + JSON.stringify(attachment));
                                    }
                                }
                                return {
                                    filename: calcPath(attachment),
                                    mime_type: attachment.mime_type,
                                    //TODO: x/y size for img
                                    original: attachment
                                };
                            });
                        }
                        return {
                            id: message.ROWID,
                            date: messages.toDateFromCFDate(message.date),
                            text: message.text,
                            attachments: message.attachments,
                            is_from_me: message.is_from_me,
                            original: message
                        };
                    });
                }
                writeChat(chat);
            });

        }).catch(function(error) {
            console.error(error);
        });


    } else {
        if (record.path && record.path.indexOf(grepString) != -1) {
            smsData[record.path] = record;
        }
    }
});
