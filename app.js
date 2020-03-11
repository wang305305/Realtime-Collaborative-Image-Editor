const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('frontend'));

app.use((req, res, next) => {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'test';
const ObjectId = require('mongodb').ObjectId

// Connect using MongoClient
const connect = (callback) => {
  mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) return console.log(err);
    callback(client.db(dbName));
  });
};

// connect to room, redirect if room doesn't exist.
app.get("/:room", (req, res, next) => {
  let room = `/${req.params.room}`;
  connect(db => {
    db.collection('rooms').findOne({ room_id: room }, (err, item) => {
      if (err) return console.log(err);
      if (item) return res.sendFile(__dirname + '/frontend/room.html');
      else return res.redirect('/index.html');
    });
  });
});

// redirect to room select page.
app.get("/", (req, res, next) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

const getRooms = (callback) => {
  connect(db => {
    db.collection('rooms').find({}, { _id: 0, canvas: 0 }).toArray((err, items) => {
      if (err) return console.log(err);
      let room_list = items.map(item => item.room_id);
      callback(room_list);
    });
  });
}

const findRoom = (room, callback) => {
  connect(db => {
    db.collection('rooms').findOne({ room_id: room }, (err, item) => {
      if (err) return console.log(err);
      callback(item);
    });
  });
};

const createRoom = (room, callback) => {
  connect(db => {
    db.collection('rooms').insertOne({ room_id: room, canvas: "" }, (err, item) => {
      if (err) return console.log(err);
      callback(item);
    });
  });
};

const updateRoom = (room, canvas, callback) => {
  connect(db => {
    canvas.startIndex = 0;
    db.collection('rooms').findOneAndUpdate({ room_id: room }, { $set: { canvas: canvas } }, { returnOriginal: false }, (err, item) => {
      if (err) return console.log(err);
      callback(item);
    });
  });
};

io.on('connection', socket => {

  // retrive the rooms from database and send.
  socket.on('getrooms', data => {
    getRooms(room_list => {
      io.to(socket.id).emit('listrooms', room_list);
    });
  });

  // join the room
  socket.on('joinroom', data => {
    socket.join(data.room);
    findRoom(data.room, (item) => {
      if (item) {
        io.to(socket.id).emit("firstjoin", { room: item.room_id, canvas: item.canvas });
        // io.to(socket.id).emit('canvasload', { room: item.room_id, canvas: item.canvas });
        return;
      }
      else return io.to(socket.id).emit('redirect', { destination: '/index.html' });
    });
  });

  // create a new room
  socket.on('newroom', data => {
    let newroom = data.room.indexOf("/") > 0 ? data.room : `/${data.room}`;
    // check if room exists
    findRoom(newroom, (item) => {
      if (item) return io.emit('error', `Room ${newroom} already exists.`);
      createRoom(newroom, (item) => {
        getRooms(room_list => {
          io.emit('listrooms', room_list);
        });
      });
    });
  });

  //retrive canvas data from remote user
  socket.on('canvasupdate', data => {
    // find the room
    findRoom(data.room, (item) => {
      let combinedCanvas = { startIndex: 0 };
      // modify the points array
      let oldCanvas = item.canvas;
      let newCanvas = data.canvas;
      if (oldCanvas === "") {
        combinedCanvas["points"] = newCanvas.points;
      }
      else {
        oldCanvas.points[oldCanvas.points.length - 1].pop();
        newCanvas.points[0].pop();
        combinedCanvas["points"] = oldCanvas.points.concat(newCanvas.points);
      }
      // update the room with the appended array.
      updateRoom(data.room, combinedCanvas, (item) => {
        io.to(data.room).emit('canvasload', { room: item.value.room, canvas: combinedCanvas });
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected from', socket.rooms);
  });
});

const PORT = 3000;

http.listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});