const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

app.use('/public', express.static('public'));

var loggedUsers = {};
var users = [];
var connections = [];

server.listen(process.env.PORT || 4000);
console.log('Server running...');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    // Send message
    socket.on('send message', function(data){
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    // New User
    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        if(loggedUsers[socket.username] === undefined){
            users.push(socket.username);
            loggedUsers[socket.username] = 1;
            updateUsernames();
        }
    });

    // Updates the user list in the sidebar
    function updateUsernames(){
        io.sockets.emit('get users', users);
    }
});
