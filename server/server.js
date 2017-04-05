var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var req = require("request");
var usersRepository = require('./userRepository');


server.listen(8081, function() {
});


io.set('origins','http://gaming-pals.com:8080');

var users = usersRepository.users;
io.on('connection', function(socket) {
    usersRepository.addUserOrUpdate(socket);
    socket.on('new-message', function(data) {
        var receiver = usersRepository.findUser(data.receiver);
        var sender = usersRepository.findUserBySocket(socket);
        data.sender = sender.username;
        var dataSocket = {};
        dataSocket.sender = {"id": sender.id};
        dataSocket.receiver = {"id": receiver.id};
        dataSocket.text = data.message;
        dataSocket.moment= + new Date();
        if(typeof receiver !== "undefined" && typeof sender!=="undefined"){
            var receivers = receiver.ids.concat(sender.ids);
            receivers.forEach((a)=>{
                if(typeof io.sockets.connected[a] !== "undefined") {
                    io.sockets.connected[a].emit('receive-message', dataSocket);
                }
            });
        }
    });

        socket.on('typing', function(data) {
            var receiver = usersRepository.findUser(data.receiver.username);
            var sender = usersRepository.findUserBySocket(socket);
            var dataSocket = {};
            dataSocket.sender = sender;
            dataSocket.typing = data.typing;
            if(typeof receiver !== "undefined"){
                receiver.ids.forEach((a)=>{
                    if(typeof io.sockets.connected[a] !== "undefined") {
                        io.sockets.connected[a].emit('istyping', dataSocket);
                    }
                });
            }
        });

    io.sockets.emit('users-connected',returnUsersConnected());

    socket.on('disconnect', function() {
        usersRepository.spliceUser(socket);
        io.sockets.emit('users-connected',returnUsersConnected());
    });


        function returnUsersConnected() {
           return usersRepository.users.map((e)=>{
               var p = {};
               p.username = e.username;
               p.picture = e.picture;
               p.id = e.id;
               return p;
           })
        }
});

