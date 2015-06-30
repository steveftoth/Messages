var q = require('q');
var sqlite3 = require('sqlite3');
var _ = require('lodash');

if(process.argv.length < 3 ) {
    console.log("enter in sql lite file of database");
}

var allChats = 'select * from chat';

function messagesForChat(chat) {
    return 'select * from message m join chat_message_join cm on cm.message_id = m.rowid where cm.chat_id = ' + chat.ROWID;
};

function attachmentsForMessage(message) {
    return 'select * from attachment a join message_attachment_join ma on a.rowid = ma.attachment_id where ma.message_id = ' + message.ROWID;
};
function handlesForChat(chat) {
    return 'select * from handle join chat_handle_join on handle.rowid = chat_handle_join.handle_id where chat_handle_join.chat_id = ' + chat.ROWID;
}

function toDateFromCFDate(date) {
    if(date && typeof date == 'number')
        return new Date(date*1000 + 978307200000).toLocaleString();
    return date;
}

function fillMessage(db, message) {
    var attachments = [];
    db.each(attachmentsForMessage(message),function(err,row){
        attachments.push(row);
    });
    message.attachments = attachments;
    return message;
}

function allSql(db,sql) {
    return q.promise(function(resolve,reject,notify) {
        db.all(sql,function(err,rows) {
            if(err)
                reject(err);
            else
                resolve(rows);
        })

    });
}

function dbInfo(dbPath) {
    var db = new sqlite3.Database(dbPath);

    var cDb = _.partial(allSql,db);
    return cDb(allChats).then(function(chats){
        return q.all(_.map(chats,function(chat) {
            return cDb(handlesForChat(chat)).then(function(handles){
                chat.handles = handles;
                return cDb(messagesForChat(chat)).then(function(messages){
                    chat.messages = messages;
                    return q.all(_.map(messages,function(message){
                        return cDb(attachmentsForMessage(message)).then(function(attachments){
                            if(attachments && attachments.length > 0) {
                                message.attachments = attachments;
                            }
                            return message;
                        });
                    })).then(function(messages){
                        return chat;
                    });
                });
            });
        }));
    });
}

module.exports.dbInfo = dbInfo;

// sms db file Library/SMS/sms.db

/*

 chat = {
 handles : [ ...]
 messages : [ {
 attachments: [ local_filename  ]
 } ]

 chat data...

 }

 */

/*
 CREATE TABLE _SqliteDatabaseProperties (key TEXT, value TEXT, UNIQUE(key));
 CREATE TABLE message (ROWID INTEGER PRIMARY KEY AUTOINCREMENT, 
 guid TEXT UNIQUE NOT NULL,
 text TEXT,
 replace INTEGER DEFAULT 0,
 service_center TEXT,
 handle_id INTEGER DEFAULT 0,
 subject TEXT,
 country TEXT,
 attributedBody BLOB,
 version INTEGER DEFAULT 0,
 type INTEGER DEFAULT 0,
 service TEXT,
 account TEXT,
 account_guid TEXT,
 error INTEGER DEFAULT 0,
 date INTEGER,
 date_read INTEGER,
 date_delivered INTEGER,
 is_delivered INTEGER DEFAULT 0,
 is_finished INTEGER DEFAULT 0,
 is_emote INTEGER DEFAULT 0,
 is_from_me INTEGER DEFAULT 0,
 is_empty INTEGER DEFAULT 0,
 is_delayed INTEGER DEFAULT 0,
 is_auto_reply INTEGER DEFAULT 0,
 is_prepared INTEGER DEFAULT 0,
 is_read INTEGER DEFAULT 0,
 is_system_message INTEGER DEFAULT 0,
 is_sent INTEGER DEFAULT 0,
 has_dd_results INTEGER DEFAULT 0,
 is_service_message INTEGER DEFAULT 0,
 is_forward INTEGER DEFAULT 0,
 was_downgraded INTEGER DEFAULT 0,
 is_archive INTEGER DEFAULT 0,
 cache_has_attachments INTEGER DEFAULT 0,
 cache_roomnames TEXT,
 was_data_detected INTEGER DEFAULT 0,
 was_deduplicated INTEGER DEFAULT 0,
 is_audio_message INTEGER DEFAULT 0,
 is_played INTEGER DEFAULT 0,
 date_played INTEGER,
 item_type INTEGER DEFAULT 0,
 other_handle INTEGER DEFAULT 0,
 group_title TEXT,
 group_action_type INTEGER DEFAULT 0,
 share_status INTEGER DEFAULT 0,
 share_direction INTEGER DEFAULT 0,
 is_expirable INTEGER DEFAULT 0,
 expire_state INTEGER DEFAULT 0,
 message_action_type INTEGER DEFAULT 0,
 message_source INTEGER DEFAULT 0);

 CREATE TABLE chat (ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
 guid TEXT UNIQUE NOT NULL,
 style INTEGER,
 state INTEGER,
 account_id TEXT,
 properties BLOB,
 chat_identifier TEXT,
 service_name TEXT,
 room_name TEXT,
 account_login TEXT,
 is_archived INTEGER DEFAULT 0,
 last_addressed_handle TEXT,
 display_name TEXT,
 group_id TEXT);

 CREATE TABLE attachment (ROWID INTEGER PRIMARY KEY AUTOINCREMENT,
 guid TEXT UNIQUE NOT NULL,
 created_date INTEGER DEFAULT 0,
 start_date INTEGER DEFAULT 0,
 filename TEXT,
 uti TEXT,
 mime_type TEXT,
 transfer_state INTEGER DEFAULT 0,
 is_outgoing INTEGER DEFAULT 0,
 user_info BLOB,
 transfer_name TEXT,
 total_bytes INTEGER DEFAULT 0);

 CREATE TABLE handle ( ROWID INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
 id TEXT NOT NULL,
 country TEXT,
 service TEXT NOT NULL,
 uncanonicalized_id TEXT,
 UNIQUE (id,
 service) );

 CREATE TABLE message_attachment_join ( message_id INTEGER REFERENCES message (ROWID) ON DELETE CASCADE,
 attachment_id INTEGER REFERENCES attachment (ROWID) ON DELETE CASCADE,
 UNIQUE(message_id,
 attachment_id));

 CREATE TABLE chat_handle_join ( chat_id INTEGER REFERENCES chat (ROWID) ON DELETE CASCADE,
 handle_id INTEGER REFERENCES handle (ROWID) ON DELETE CASCADE,
 UNIQUE(chat_id,
 handle_id));

 CREATE TABLE chat_message_join ( chat_id INTEGER REFERENCES chat (ROWID) ON DELETE CASCADE,
 message_id INTEGER REFERENCES message (ROWID) ON DELETE CASCADE,
 PRIMARY KEY (chat_id,
 message_id));

 CREATE INDEX message_idx_is_read ON message(is_read, is_from_me, is_finished);

 CREATE INDEX message_idx_failed ON message(is_finished, is_from_me, error);

 CREATE INDEX message_idx_handle ON message(handle_id, date);

 CREATE INDEX chat_idx_identifier ON chat(chat_identifier);

 CREATE INDEX chat_idx_room_name ON chat(room_name);

 CREATE INDEX message_idx_was_downgraded ON message(was_downgraded);

 CREATE INDEX chat_message_join_idx_message_id ON chat_message_join(message_id, chat_id);
 CREATE TRIGGER set_message_has_attachments AFTER INSERT ON message_attachment_join BEGIN     UPDATE message       SET cache_has_attachments = 1     WHERE       message.ROWID = new.message_id; END;
 CREATE TRIGGER update_message_roomname_cache_insert AFTER INSERT ON chat_message_join BEGIN     UPDATE message       SET cache_roomnames = (         SELECT group_concat(c.room_name)         FROM chat c         INNER JOIN chat_message_join j ON c.ROWID = j.chat_id         WHERE           j.message_id = new.message_id       )       WHERE         message.ROWID = new.message_id; END;
 CREATE TRIGGER update_message_roomname_cache_delete AFTER DELETE ON chat_message_join BEGIN     UPDATE message       SET cache_roomnames = (         SELECT group_concat(c.room_name)         FROM chat c         INNER JOIN chat_message_join j ON c.ROWID = j.chat_id         WHERE           j.message_id = old.message_id       )       WHERE         message.ROWID = old.message_id; END;
 CREATE TRIGGER before_delete_attachment_files BEFORE DELETE ON attachment BEGIN   SELECT before_delete_attachment_path(old.ROWID, old.guid); END;
 CREATE TRIGGER delete_attachment_files AFTER DELETE ON attachment BEGIN   SELECT delete_attachment_path(old.filename); END;
 CREATE TRIGGER clean_orphaned_handles2 AFTER DELETE ON message BEGIN     DELETE FROM handle         WHERE handle.ROWID = old.handle_id     AND         (SELECT 1 from chat_handle_join WHERE handle_id = old.handle_id LIMIT 1) IS NULL     AND         (SELECT 1 from message WHERE handle_id = old.handle_id LIMIT 1) IS NULL; END;
 CREATE TRIGGER clean_orphaned_handles AFTER DELETE ON chat_handle_join BEGIN     DELETE FROM handle         WHERE handle.ROWID = old.handle_id     AND         (SELECT 1 from chat_handle_join WHERE handle_id = old.handle_id LIMIT 1) IS NULL     AND         (SELECT 1 from message WHERE handle_id = old.handle_id LIMIT 1) IS NULL; END;
 CREATE TRIGGER clear_message_has_attachments AFTER DELETE ON message_attachment_join BEGIN     UPDATE message       SET cache_has_attachments = 0     WHERE       message.ROWID = old.message_id       AND       (SELECT 1 from message_attachment_join WHERE message_id = old.message_id LIMIT 1) IS NULL; END;
 CREATE TRIGGER clean_orphaned_attachments AFTER DELETE ON message_attachment_join BEGIN     DELETE FROM attachment         WHERE attachment.ROWID = old.attachment_id     AND         (SELECT 1 from message_attachment_join WHERE attachment_id = old.attachment_id LIMIT 1) IS NULL; END;
 CREATE TRIGGER clean_orphaned_messages AFTER DELETE ON chat_message_join BEGIN     DELETE FROM message     WHERE (         SELECT 1 FROM chat_message_join         WHERE message_id = message.rowid         LIMIT 1     ) IS NULL; END;

 */