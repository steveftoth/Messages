'use strict';

requirejs.config({
  shim: {
    'bootstrap': { 'deps': ['jquery']}
  }, paths: {
    'jquery': 'jquery',
    'bootstrap': 'bootstrap'

  }
});

require(['jquery','bootstrap','lodash'], function($, bootstrap,_) {

  function toDateFromCFDate(date) {
    if(date && typeof date == 'number')
      return new Date(date*1000 + 978307200000);
    return date;
  }

  function calcPath(attachment) {
    return 'data/resource/' + _.last(attachment.filename.split('/'));
  }

  function showConversation(conversationId) {
    console.log(conversationId);
    $.get('data/chats/'+ conversationId + '.json',
        function(data,status) {
          $('#messages-container').empty();
          var mc = $('#messages-container').append($('<ul/>',{'class': 'list-group'}));

          //console.log(data);
          _.each(data.messages.sort(function(a,b){
            return b.date - a.date;
          }),function( message ) {
            //if(message.attachments || message.attachment) {
            //  console.log(message);
            //}
            delete message.attributedBody;
            var messageText = message.text;
            if (!messageText)
              messageText = '';
            var mt = $('<li/>' +  + '</li>',{'class':'list-group-item', text: toDateFromCFDate(message.date).toLocaleString() + ' - ' + messageText , title: JSON.stringify(message)});
            if(message['is_from_me'] == 1)
              mt.addClass('message-from-me');
            else
              mt.addClass('message-to-me');
            mt.appendTo(mc);
            if(message.attachments) {
              _.each(message.attachments,function(attachment){
                //console.log(attachment);
                if(attachment['mime_type'].indexOf('image') >= 0 ) {
                  console.log(['attaching',attachment]);
                  mc.append('<img src=' + calcPath(attachment) + ' >')
                  //$('<img/>',{
                  //  src: calcPath(attachment)
                  //}).appendTo(mc);
                }
              });
            }
          });

        });
  }

  function showChats(chats) {
    console.log(chats);
    var list = $('<ul/>', {'class':'dropdown-menu', 'aria-labelledby': 'dropdownMenu1'} );
    $('<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
    'Conversations <span class="caret"></span></button>' ) .appendTo('#conversations-container')
    list.appendTo('#conversations-container');

    var messageList = _.map(chats,function( chat ) {
      var id = chat.id;
      var title = chat.chat_identifier;
      $('<a/>', { text: title , click: function() {
        showConversation(id);
      }}).appendTo($('<li/>').appendTo(list));
    });



  }
  console.log("loaded!");

  $.get(
    'data/chats.json',
    function(data,status) {
      showChats(data);
    }
  );
});