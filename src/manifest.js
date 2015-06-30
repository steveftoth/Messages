var binary = require('binary');
var _ = require('lodash');
var fs = require('fs');
var crypto = require('crypto');




function readString(b,key) {

    b.into(key,function(keys) {
        this.word16bu('length').tap(function(keys){
            if(keys['length'] != 65535 && keys['length'] != 0 ) {
                //console.log(key + ' length ' + keys.length);

                this.buffer('str', keys['length'])
                    .tap(function (keys) {
                        keys['str'] = keys['str'].toString('utf8');
                    });
            } else {
                keys['length'] = 0;
            }
        });
    }).tap(function(keys){
        keys[key] = keys[key]['str'];
    });
}


function readBackupDatabase(fileName, cb) {

    ws = binary().buffer('filetype',4).buffer('version',2).tap(function(vars){
        if(vars.filetype.toString('utf8') != 'mbdb' && vars.version[0] != 5 && vars.version[1] != 0) {
            console.log("Unknown file version " + vars.filetype + " " +vars.version);
        }
    });

    ws.flush();
    ws.loop(function(end,vars) {
        readString(this, 'domain');
        this.tap(function(vars) {
            if (vars.domain.length > 0) {
                readString(this, 'path');
                readString(this, 'linkTarget');
                readString(this, 'dataHash');
                readString(this, 'encryptionKey');
                this.word16bu('mode');
                this.word64bu('inode');
                this.word32bu('uid');
                this.word32bu('gid');
                this.word32bu('mtime');
                this.word32bu('atime');
                this.word32bu('ctime');
                this.word64bu('fileLength');
                this.word8bu('flag');
                this.word8bu('propertyCount');
                this.tap(function (pVars) {
                    //calc the hash
                    var c = crypto.createHash('sha1');
                    c.update(pVars.domain+ '-'+ pVars.path);
                    pVars.sha = c.digest('hex');
                    //read all the properties
                    if(pVars.propertyCount) {
                        for (var i = 0; i < pVars.propertyCount; ++i) {
                            readString(this, 'name' + i);
                            readString(this, 'value' + i);
                        }
                        this.tap(function (pVars) {
                            pVars.property = [];
                            for (var i = 0; i < pVars.propertyCount; ++i) {
                                var o = {};
                                o[pVars['name' + i]] = pVars['value' + i];
                                pVars.property.push(o);
                            }
                        });
                    }
                });
                this.tap(function (vars) {
                    if(cb && typeof cb == 'function') {
                        cb(vars);
                    }
                    this.flush();
                });

            }
        });
    });

    var rs = fs.createReadStream(fileName);

    rs.on('end', function() {
        if(cb && typeof cb == 'function') {
            cb(null);
        }
    });

    rs.pipe(ws);
}

module.exports.readBackupDatabase = readBackupDatabase;

