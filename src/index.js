//import modules
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage}=require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom}=require("./utils/users");


//create server
const app = express();
const server = http.createServer(app);//manually creating server outside express library, nescesary for setting up socket.io
const io = socketio(server);

//configure server

////Set Port
port = process.env.PORT;

////Set Public folder
const publicDirectoryPath = path.join(__dirname,"../public");
app.use(express.static(publicDirectoryPath));


//sockets
io.on('connection', (socket)=>{
    //Acknowledges new connection and sends welcome message
    console.log('New WebSocket connection');



    //Join
    socket.on('join', ({username,room},callback)=>{
        const {error,user} = addUser({
            id: socket.id,
            username:username,
            room:room
        });

        if(error){
            return callback(error)
        }

        socket.join(user.room);

        socket.emit('message',generateMessage('Welcome!'));

        //Informs users when a new user has joined
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`,user.username));

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        });

        callback()
    } );

    //Receives messages from users and emits it to all users
    socket.on('sendMessage',(message, callback)=>{
        //get user
        const user = getUser(socket.id);

        if(!user){
            return
        }

        //Checks for profanity
        const filter = new Filter();
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        //Emits message to all users
        io.to(user.room).emit('message',generateMessage(message,user.username));

        //Acknowledges delivery
        callback()
    });

    //Recieves user location and shares it with other users
    socket.on('sendLocation',(location, callback)=>{

        const user = getUser(socket.id);

        if(!user){
            return
        }

        //informs user if no location received
        if(!location){
            return callback('Cannot access location')
        }
        //emits user location with link to google map
        io.to(user.room).emit('locationString',generateMessage(`https://google.com/maps?q=${location.lat},${location.long}`,user.username));

        //Acknowledges location shared
        callback()
    });

    //Informs users when a user has disconnected or left the chat
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left the chat`,user.username))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }


    })

});




//Start Server
server.listen(port,(error,response)=>{
    if(error){
        console.log(error)
    }else{
        console.log("Server up and running on port: " + port)
    }
});