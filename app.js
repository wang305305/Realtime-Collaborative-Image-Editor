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

<<<<<<< HEAD
// const url = 'mongodb://user1:123456a@ds245615.mlab.com:45615/heroku_lbg5q1hr';
// const dbName = 'heroku_lbg5q1hr';

const url = 'mongodb://localhost:27017';
const dbName = 'test';
=======
const url = 'mongodb://user1:123456a@ds245615.mlab.com:45615/heroku_lbg5q1hr';
const dbName = 'heroku_lbg5q1hr';

// const url = 'mongodb://localhost:27017';
// const dbName = 'test';
>>>>>>> cde7f77586781c8cb12b28f054cce8cd19d3ffa4

const room_list = 'room_list';
const room_points = 'room_points';

// Connect using MongoClient
const connect = (callback) => {
  mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) return console.error(err);
    callback(client.db(dbName));
  });
};

// initilize the database.
connect(db => {
  // check if collections exist.
  db.listCollections().toArray((err, collections) => {
    collections = collections.map(col => col.name);
    if (collections.indexOf(room_list) == -1) {
      console.log(`creating collection '${room_list}'`);
      db.createCollection(room_list);
    }
    if (collections.indexOf(room_points) == -1) {
      console.log(`creating collection '${room_points}'`);
      db.createCollection(room_points);
<<<<<<< HEAD
      db.collection(room_points).createIndex({ subject: "text" });
=======
>>>>>>> cde7f77586781c8cb12b28f054cce8cd19d3ffa4
    }
  });
});

// connect to room, redirect if room doesn't exist.
app.get("/:room", (req, res, next) => {
  let room = `/${req.params.room}`;
  connect(db => {
    db.collection(room_list).findOne({ room_id: room }, (err, item) => {
      if (err) return console.error(err);
      if (item) return res.sendFile(__dirname + '/frontend/room.html');
      else return res.redirect('/index.html');
    });
  });
});

// redirect to room select page.
app.get("/", (req, res, next) => {
  res.sendFile(__dirname + '/frontend/index.html');
});

// gets the list of rooms.
const getRooms = (callback) => {
  connect(db => {
    db.collection(room_list).find({}, { _id: 0, canvas: 0 }).toArray((err, items) => {
      if (err) return console.error(err);
      let room_list = items.map(item => item.room_id);
      callback(room_list);
    });
  });
}

// check if a room exists.
const findRoom = (room, callback) => {
  connect(db => {
    db.collection(room_list).findOne({ room_id: room }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// creates a new room.
const createRoom = (room, callback) => {
  connect(db => {
    db.collection(room_list).insertOne({ room_id: room }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// gets the entire room.
const getRoom = (room, callback) => {
  connect(db => {
    db.collection(room_points).find({ room_id: room }).toArray((err, items) => {
      if (err) return console.error(err);
      let canvas = { points: [], startIndex: 0 };
      let points = [];
      // create points array for the room.
<<<<<<< HEAD
      items.forEach((item, i) => {
=======
      items.forEach(item => {
        // remove start and end from points
        item.canvas.points[0].pop();
        item.canvas.points[item.canvas.points.length - 1].pop();
>>>>>>> cde7f77586781c8cb12b28f054cce8cd19d3ffa4
        points = points.concat(item.canvas.points);
      });
      if (points.length > 0) {
        // add start and end to points.
        points[0].push("start");
        points[points.length - 1].push("end");
        canvas.points = points;
      }
      let result = { room: room, canvas: canvas};
      callback(result);
<<<<<<< HEAD
    });
  });
};

// adds a new entry to a room.
const updateRoom = (room, canvas, callback) => {
  connect(db => {
    // check if adding image.
    if (canvas.points[0][0] === "image") {
      // find and delete the existing image.

      console.log("image");
    }
    db.collection('room_points').insertOne({ room_id: room, canvas: canvas }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// deletes the room and all entries.
const deleteRoom = (room, callback) => {
  connect(db => {
    db.collection(room_list).deleteOne({ room_id: room }, (err, res) => {
      if (err) return console.error(err);
      if (res.deletedCount) console.log(`Deleted room '${room}'`);
      db.collection(room_points).deleteMany({ room_id: room }, (err, res) => {
        if (err) return console.error(err);
        console.log(`Deleted ${res.deletedCount} documents from '${room_points}'.`);
        callback();
      })
    });
  });
};

// create a new socket for the new connection.
io.on('connection', socket => {
  // retrive the rooms from database and send.
  socket.on('getrooms', data => {
    getRooms(room_list => {
      io.to(socket.id).emit('listrooms', room_list);
    });
  });
=======
    });
  });
};

// adds a new entry to a room.
const updateRoom = (room, canvas, callback) => {
  connect(db => {
    db.collection('room_points').insertOne({ room_id: room, canvas: canvas }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// deletes the room and all entries.
const deleteRoom = (room, callback) => {
  connect(db => {
    db.collection(room_list).deleteOne({ room_id: room }, (err, res) => {
      if (err) return console.error(err);
      if (res.deletedCount) console.log(`Deleted room '${room}'`);
      db.collection(room_points).deleteMany({ room_id: room }, (err, res) => {
        if (err) return console.error(err);
        console.log(`Deleted ${res.deletedCount} documents from '${room_points}'.`);
        callback();
      })
    });
  });
};

// create a new socket for the new connection.
io.on('connection', socket => {
  // retrive the rooms from database and send.
  socket.on('getrooms', data => {
    getRooms(room_list => {
      io.to(socket.id).emit('listrooms', room_list);
    });
  });
>>>>>>> cde7f77586781c8cb12b28f054cce8cd19d3ffa4

  // join the room
  socket.on('joinroom', data => {
    socket.join(data.room);
    findRoom(data.room, (item) => {
      if (item) {
        getRoom(data.room, (item) => {
          return io.to(socket.id).emit("firstjoin", { room: item.room, canvas: item.canvas });
        })
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
      createRoom(newroom, () => {
        getRooms(room_list => {
          io.emit('listrooms', room_list);
        });
      });
    });
  });

  // delete a room
  socket.on('deleteroom', data => {
    deleteRoom(data.room, () => {
      getRooms(room_list => {
        io.emit('listrooms', room_list);
        io.to(data.room).emit('redirect', { destination: '/index.html' });
      });
    });
  });

  //retrive canvas data from remote user
  socket.on('canvasupdate', data => {
<<<<<<< HEAD
    // send the update to all users in room.
    io.to(data.room).emit('canvasload', { room: data.room, canvas: data.canvas });
=======

    // send the update to all users in room.
    io.to(data.room).emit('canvasload', { room: data.room, canvas: data.canvas });

>>>>>>> cde7f77586781c8cb12b28f054cce8cd19d3ffa4
    // add the new canvas to the database.
    updateRoom(data.room, data.canvas, (item) => {
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected from', socket.rooms);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});