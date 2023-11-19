const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const users = [];
const rooms = {};
const app = express();
const server = http.createServer(app, {
    cors: {
        origin: '*',
    }
});
const io = socketIO(server);

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

function generateId() {
    return 'xxx-xxx-xxx'.replace(/[x]/g, function (c) {
        return String.fromCharCode(Math.random() * 26 + 'a'.charCodeAt(0));
    });
};

app.get('/', (req, res) => {
    res.redirect(`/${generateId()}`);
});
app.get('/:room', (req, res) => {
    res.render('index', { roomId: req.params.room });
});

io.on('connection', (socket) => {
    // Room logic here
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('new-user', socket.id);

        // Lưu thông tin người dùng vào phòng
        if (!rooms[roomId]) {
            rooms[roomId] = { members: [] };
        }
        rooms[roomId].members.push(socket.id);
        console.log(`🚀 ~ socket.on ~ rooms:`, rooms)

        // Gửi thông tin thành viên trong phòng cho client
        socket.emit('all-users', rooms[roomId].members);
    });

    // Handle signaling logic here
    // socket.broadcast.emit('new-user', socket.id);
    console.log(socket.id);
    users.push(socket.id);
    // socket.emit('all-users', users);
    socket.on('disconnect', () => {
        // users.splice(users.indexOf(socket.id), 1);
        // socket.broadcast.emit('user-disconnected', socket.id);
        // Xóa thông tin người dùng khi ngắt kết nối
        const roomId = Object.keys(rooms).find((roomId) =>
            rooms[roomId].members.includes(socket.id)
        );
        if (roomId) {
            rooms[roomId].members.splice(rooms[roomId].members.indexOf(socket.id), 1);
            socket.broadcast.to(roomId).emit('user-disconnected', socket.id);
        }
    });

    socket.on('offer', (data) => {
        io.to(data.target).emit('offer', { target: socket.id, offer: data.offer });
    });

    socket.on('answer', (data) => {
        io.to(data.target).emit('answer', data.answer);
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.target).emit('ice-candidate', data.candidate);
    });

    socket.on('end-call', (remoteUserId) => {
        io.to(remoteUserId).emit('end-call');
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
