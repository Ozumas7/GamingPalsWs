let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let req = require("request");
let usersRepository = require('./userRepository');


server.listen(8081, function() {
});


io.set('origins','localhost:8080');

let users = usersRepository.users;
io.on('connection', function(socket) {

    if (usersRepository.checkIfUser(socket)){

    usersRepository.addUserOrUpdate(socket);
    socket.on('new-message', function(data) {
        let receiver = usersRepository.findUser(data.receiver);
        let sender = usersRepository.findUserBySocket(socket);
        data.sender = sender.username;
        let dataSocket = {};
        dataSocket.sender = {"id": sender.id};
        dataSocket.receiver = {"id": receiver.id};
        dataSocket.text = data.message;
        dataSocket.moment= + new Date();
        if(typeof receiver !== "undefined" && typeof sender!=="undefined"){
            let receivers = receiver.ids.concat(sender.ids);
            receivers.forEach((a)=>{
                if(typeof io.sockets.connected[a] !== "undefined") {
                    io.sockets.connected[a].emit('receive-message', dataSocket);
                }
            });
        }
    });

        socket.on('typing', function(data) {
            let receiver = usersRepository.findUser(data.receiver.username);
            let sender = usersRepository.findUserBySocket(socket);
            let dataSocket = {};
            dataSocket.sender = sender;
            dataSocket.typing = data.typing;
            if(typeof receiver !== "undefined"){
                receiver.ids.forEach((a)=>{
                    if(typeof io.sockets.connected[a] !== "undefined") {
                        console.log("ey");
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
               let p = {};
               p.username = e.username;
               p.picture = e.picture;
               p.id = e.id;
               return p;
           })
        }
    }
});

