var m = require('./manifest.js');




var backupDir = process.argv[2];

var grepString = process.argv[3];

m.readBackupDatabase(backupDir + '/' + 'Manifest.mbdb',function(record){
    if(grepString) {

        if(record.path && record.path.indexOf(grepString) != -1) {
            console.log(record);
        }
    } else {
        console.log(record);
    }
});

// sms db file Library/SMS/sms.db