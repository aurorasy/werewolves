var serverUrl = "/";
var localStream, room;

  var createToken = function(userName, role, callback) {

    var req = new XMLHttpRequest();
    var url = serverUrl + 'createToken/';
    var body = {roomId: getParameterByName('id'), username: userName, role: role};

    req.onreadystatechange = function () {
      if (req.readyState === 4) {
        callback(req.responseText);
      }
    };

    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(body));
  };


function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function printText(text) {
  document.getElementById('messages').value += '- ' + text + '\n';
}

DEMO.init_demo = function (my_name) {

        
    var screen = getParameterByName("screen");
  var config = {audio: true, video: true, data: true, screen: screen, attributes: {name:my_name}};
  localStream = Erizo.Stream(config);
  DEMO.chat_stream = localStream;

  createToken(my_name, "presenter", function (response) {
    var token = response;
    console.log(token);
    room = Erizo.Room({token: token});


window.onresize=function(){DEMO.resizeVideos(localStream, room.remoteStreams);};
/*
  if( document.createEvent) {
var event = document.createEvent ("HTMLEvents");
event.initEvent("resize", true, true);
window.dispatchEvent(event);
} else if(document.createEventObject){
window.fireEvent("onresize");
} 
*/


    localStream.addEventListener("access-accepted", function () {
     // printText('You accepted to share your devices.');
     // printText(localStream.getID());
      var subscribeToStreams = function (streams) {
        for (var index in streams) {
          var stream = streams[index];
                    if (localStream.getID() !== stream.getID()) {
            room.subscribe(stream);
          }
          //room.subscribe(stream);
        }
      };

      room.addEventListener("room-connected", function (roomEvent) {
        printText('Welcome to werewolf room.');
        DEMO.connect_to_chat();
        room.publish(localStream, {maxVideoBW: 300});
        subscribeToStreams(roomEvent.streams);
      });

      room.addEventListener("stream-subscribed", function(streamEvent) {
       // printText('Subscribed to your local stream.');
        var stream = streamEvent.stream;
        //stream.show("my_subscribed_video");
        
          
        add_div_to_grid("test" + stream.getID());
        stream.show("test" + stream.getID());
        DEMO.add_chat_participant(stream.getAttributes().name, stream.getID());

        DEMO.resizeVideos(localStream, room.remoteStreams);

        stream.addEventListener("stream-data", DEMO.chat_message_received);
        

      });

      room.addEventListener("stream-added", function (streamEvent) {
       // printText('Local stream published.');
        var streams = [];
        streams.push(streamEvent.stream);
        subscribeToStreams(streams);
        // room.publish(localStream);
        //add_div_to_grid("test" + localStream.getID());
        //localStream.show("test" + localStream.getID());
        //document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
      });

      room.addEventListener("stream-removed", function (streamEvent) {
        // Remove stream from DOM
        var stream = streamEvent.stream;
        if (stream.elementID !== undefined) {
         
  DEMO.remove_chat_participant(stream.getAttributes().name, stream.getID());
          
          remove_div_from_grid(stream.elementID, "video_grid");
          DEMO.resizeVideos(localStream, room.remoteStreams);
          //var element = document.getElementById(stream.elementID);
          //document.body.removeChild(element);
        }
      });
      
      room.addEventListener("stream-failed", function (streamEvent){
          console.log("STREAM FAILED, DISCONNECTION");
          printText('STREAM FAILED, DISCONNECTION');
          room.disconnect();
      });

      room.connect();

      add_div_to_grid("localVideo");
      localStream.show("localVideo");
      DEMO.resizeVideos(localStream, room.remoteStreams);


    });
    localStream.init();
  });
};

var add_div_to_grid = function(divId) {

    //$('#video_grid').css('border', 'none');
    var grid = document.getElementById('video_grid');
    var newDiv = document.createElement('div');
    newDiv.setAttribute("id", divId + '_container');
    newDiv.className = newDiv.className + "grid_element_border";

    var newDiv2 = document.createElement('div');
    newDiv2.setAttribute("id", divId);
    newDiv2.className = newDiv2.className + "grid_element";
    newDiv.appendChild(newDiv2);

    var newDiv3 = document.createElement('div');
    newDiv3.setAttribute("id", divId + '_info');
    newDiv3.className = "grid_element_info";
    newDiv.appendChild(newDiv3);

    var newDiv4 = document.createElement('div');
    newDiv4.setAttribute("id", 'like'+divId);
    newDiv4.className = "heart";
    newDiv4.setAttribute("rel","like");
    newDiv3.appendChild(newDiv4);
    newDiv4.setAttribute("style","display:none");

    var newDiv5 = document.createElement('h3');
    newDiv5.setAttribute("id", 'likeCount'+divId);
    newDiv5.innerHTML = "0";
    newDiv5.className = "likeCount";
    newDiv3.appendChild(newDiv5);
    newDiv5.setAttribute("style","display:none");

    var newDiv6 = document.createElement('h2');
    newDiv6.setAttribute("id", divId +'_result_show');
    newDiv6.className = "span7";
    newDiv6.setAttribute("rows","2");
    newDiv3.appendChild(newDiv6);

    var newDiv8 = document.createElement('p');
    newDiv8.setAttribute("id", divId +'_name');
    newDiv8.className = "span1";
    newDiv3.appendChild(newDiv8);

    grid.appendChild(newDiv);   
    var nChilds = grid.childElementCount;
    for(var i = 1; i <= nChilds; i++)
    {
    grid.childNodes[i].setAttribute("style", "width: 256px; height: 233px;");
    }
   // resizeGrid('video_grid');
}
var remove_div_from_grid = function(divId) {

    var grid = document.getElementById('video_grid');
    grid.removeChild(document.getElementById(divId + '_container'));
    //resizeGrid('video_grid');
   
}

var resizeGrid = function() {

    var grid = document.getElementById('video_grid');
    var nChilds = grid.childElementCount;

    var c = Math.floor((nChilds-1)/3);
    var r = (nChilds-1) % 3;

    if (nChilds === 1) {
        grid.childNodes[1].setAttribute("style", "width: 100%; height: 100%;");
    } else {

        var height = 100/(c+1);
        
        for(var i = 1; i <= nChilds; i++) {

            var row = Math.floor((i-1) / 3);
            var width = 100/3;

            if (r === 0) {  // las dos últimas filas tienen dos vídeos

                if (row > c - 2) { 
                    width = 50;
                }
                grid.childNodes[i].setAttribute("style", "width: " + width + "%; height: " + height + "%;");

            } else if (r === 1) {  // la última fila tiene un vídeo
                if (row === c) { 
                    width = 50;
                }
                grid.childNodes[i].setAttribute("style", "width: " + width + "%; height: " + height + "%;");

            } else {
                grid.childNodes[i].setAttribute("style", "width: " + width + "%; height: " + height + "%;");
            }
        }
    }
} 
