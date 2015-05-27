var _ = require('lodash');

var m = require('./manifest.js');

var messages = require('./messages.js');



var backupDir = process.argv[2];

var targetDir = process.argv[3];

var grepString = 'Library/SMS';
var smsData = {};
m.readBackupDatabase(backupDir + '/' + 'Manifest.mbdb',function(record) {
    if(record.path && record.path.indexOf(grepString) != -1) {
       smsData[record.path] = record;
    }
});

//execute some queries...


// sms db file Library/SMS/sms.db

var dbPath = backupDir + '/' + messages.smsData['Library/SMS/sms.db'].sha;

var info = messages.dbInfo(dbPath);