var _ = require('lodash');

var m = require('./manifest.js');

var messages = require('./messages.js');

var fse = require('fs-extra');


var backupDir = process.argv[2];
console.error(backupDir);

var targetDir = process.argv[3];

var grepString = 'Library/SMS';
var smsData = {};

function writeChat(chat) {
    writeObjectToFile(targetDir + '/chats/' + chat.ROWID + '.json',chat);
}

function writeObjectToFile(file, obj) {
    fse.outputJsonSync(file,obj);
}


m.readBackupDatabase(backupDir + '/' + 'Manifest.mbdb',function(record) {
    if(record == null) {
        var dbPath = backupDir + '/' + smsData['Library/SMS/sms.db'].sha;

        messages.dbInfo(dbPath).then(function(chats){
            // base/resource -> files referenced from message attachments
            // base/chats/<<id>>.json
            // base/chats.json -> chat ids
            var ids = _.map(chats,function(chat){
                return chat.ROWID;
            });
            writeObjectToFile(targetDir + '/chats.json',ids);
            _.forEach(chats,function(chat){
                writeChat(chat);
                if(chat.messages) {
                    _.forEach(chat.messages, function (message) {
                        if (message.attachments) {
                            _.forEach(message.attachments, function (attachment) {
                                //console.log(JSON.stringify(attachment));
                                var fullFilename = attachment['filename'];
                                if(fullFilename) {
                                    //console.log(fullFilename);
                                    if (fullFilename.indexOf('~/') == 0) {
                                        fullFilename = fullFilename.slice('~/'.length);
                                    }
                                    if (fullFilename.indexOf('/var/mobile/') == 0) {
                                        fullFilename = fullFilename.slice('/var/mobile/'.length);
                                    }
                                    //console.log(['fullFilename', fullFilename, smsData[fullFilename]]);
                                    if (smsData[fullFilename]) {

                                        attachment['sha'] = smsData[fullFilename]['sha'];
                                        var filename = fullFilename.split('/');
                                        if (filename && filename.length > 1) {
                                            filename = filename[filename.length - 1];
                                        }
                                        console.log('cp "' + backupDir + '/' + attachment['sha'] + '" ' + targetDir + '/' + filename);
                                        fse.copySync(backupDir+'/'+attachment['sha'], targetDir+'/resource/'+filename);

                                    } else {
                                        console.error("Can't find attachment in backup for " + fullFilename + ' ' + JSON.stringify(attachment));
                                    }
                                }
                            });
                        }
                    });
                }

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
