const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app, {
    cors: {
        origin: '*',
    }
});
const io = socketIO(server);

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    // Handle signaling logic here
    console.log('User connected');
    console.log(socket.id);

    socket.broadcast.emit('user-connected', socket.id);

    socket.on('offer', (data) => {
        io.to(data.target).emit('offer', { target: socket.id, offer: data.offer });
    });

    socket.on('answer', (data) => {
        io.to(data.target).emit('answer', data.answer);
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.target).emit('ice-candidate', data.candidate);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
