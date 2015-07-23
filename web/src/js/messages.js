'use strict';

requirejs.config({
  shim: {
    'bootstrap': { 'deps': ['jquery']}
  }, paths: {
    'jquery': 'jquery',
    'bootstrap': 'bootstrap'

  }
});

require(['jquery','bootstrap','lodash', 'moment.min'], function($, bootstrap, _, moment) {

  var dateFormat = 'MMM Do YY';

  var dateTimeFormat = 'MMM Do YY, h:mm:ss a';

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
            var mt = $('<li/>' +  + '</li>',{'class':'list-group-item', text: moment(message.date).format(dateTimeFormat) + ' - ' + messageText , title: JSON.stringify(message)});
            if(message['is_from_me'] == 1)
              mt.addClass('message-from-me');
            else
              mt.addClass('message-to-me');
            mt.appendTo(mc);
            if(message.attachments) {
              _.each(message.attachments,function(attachment){
                //console.log(attachment);
                if(attachment['mime_type'].indexOf('image') >= 0 ) {
                  ///console.log(['attaching',attachment]);
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
    chats.sort(function(a,b){ //reverse sort by end date, newest updated convs on top
      return moment(b.endDate).diff(moment(a.endDate));
    });

    var messageList = _.each(chats,function( chat ) {
      var id = chat.id;
      var title = chat.chat_identifier;
      var chatTitle = $('<a/>', { text: title , click: function() {
        showConversation(id);
      }}).appendTo($('<li/>').appendTo('#conversations-list'));
      chatTitle.append($('<div/>',{text: moment(chat.startDate).format(dateFormat) + ' - ' + moment(chat.endDate).format(dateFormat)})
          .append($('<span/>', {text: chat.count, class: 'badge chat-badge'})));

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