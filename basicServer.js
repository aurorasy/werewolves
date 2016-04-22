/*global require, __dirname, console*/
/*var sys = require('sys');
var execSync = require('child_process').execSync;
 */
/*function puts(error, stdout, stderr) { sys.puts(stdout);
console.log(error, stdout,stderr); }
execSync("sh ./licode/scripts/initLicode.sh", puts);

var myscript = execSync('sh ./licode/scripts/initLicode.sh');
myscript.stdout.on('data',function(data){
    console.log(data); // process output will be displayed here
});
myscript.stderr.on('data',function(data){
    console.log(data); // process error output will be displayed here
});*/
/*
var spawn = require('child_process').spawnSync,
    ls    = spawn('sh', ['./licode/scripts/initLicode.sh']);

ls.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

ls.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

ls.on('close', function (code) {
  console.log('child process exited with code ' + code);
});
*/
var express = require('express'),
    bodyParser = require('body-parser'),
    errorhandler = require('errorhandler'),
    morgan = require('morgan'),
    net = require('net'),
    N = require('./public/js/nuve'),
    fs = require("fs"),
    https = require("https"),
        config = require('./licode_config');

//require('child_process').exec('sh ./licode/script/initLicode.sh');


var options = {
    key: fs.readFileSync('./cert/key.pem').toString(),
    cert: fs.readFileSync('./cert/cert.pem').toString()
};

var app = express();

// app.configure ya no existe
"use strict";
app.use(errorhandler({
    dumpExceptions: true,
    showStack: true
}));
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//app.set('views', __dirname + '/../views/');
//disable layout
//app.set("view options", {layout: false});

N.API.init(config.nuve.superserviceID, config.nuve.superserviceKey, 'http://localhost:3000/');

var myRoom;

N.API.getRooms(function(roomlist) {
    "use strict";
    var rooms = JSON.parse(roomlist);
    console.log(rooms.length); //check and see if one of these rooms is 'basicExampleRoom'
    for (var room in rooms) {
        if (rooms[room].name === 'basicExampleRoom'){
            myRoom = rooms[room]._id;
        }
    }
    if (!myRoom) {

        N.API.createRoom('basicExampleRoom', function(roomID) {
            myRoom = roomID._id;
            console.log('Created room ', myRoom);
        });
    } else {
        console.log('Using room', myRoom);
    }
});


app.get('/getRooms/', function(req, res) {
    console.log('Got room ');
    "use strict";
    N.API.getRooms(function(rooms) {
        res.send(rooms);
    });
});

app.get('/getUsers/:room', function(req, res) {
    "use strict";
    var room = req.params.room;
    N.API.getUsers(room, function(users) {
        res.send(users);
    });
});


app.post('/createToken/', function(req, res) {
    "use strict";
    var room = myRoom,
        username = req.body.username,
        role = req.body.role;
    N.API.createToken(room, username, role, function(token) {
        console.log(token);
        res.send(token);
    }, function(error) {
        console.log(error);
        res.status(401).send('No Erizo Controller found');
    });
});


app.use(function(req, res, next) {
    "use strict";
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE');
    res.header('Access-Control-Allow-Headers', 'origin, content-type');
    if (req.method == 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});


app.set('port',(process.env.PORT || 3001));
app.listen(app.get('port'),function(){
    console.log('Node app is running on port',app.get('port'))
});

var server = https.createServer(options, app);
server.listen(3004);