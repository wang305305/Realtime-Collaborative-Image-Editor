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

// const url = 'mongodb://user1:123456a@ds245615.mlab.com:45615/heroku_lbg5q1hr';
// const dbName = 'heroku_lbg5q1hr';

const url = 'mongodb://localhost:27017';
const dbName = 'test';

const room_list = 'room_list';
const room_layers = 'room_layers';
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
    if (collections.indexOf(room_layers) == -1) {
      console.log(`creating collection '${room_layers}'`);
      db.createCollection(room_layers);
    }
    if (collections.indexOf(room_points) == -1) {
      console.log(`creating collection '${room_points}'`);
      db.createCollection(room_points);
    }
  });
});

// connect to room, redirect if room doesn't exist.
app.get("/room/:room_id", (req, res, next) => {
  let room_id = req.params.room_id;
  connect(db => {
    db.collection(room_list).findOne({ room_id: room_id }, (err, item) => {
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
      let room_list = items.map(item => { return { room_id: item.room_id.toString(), room_name: item.room_name } });
      callback(room_list);
    });
  });
}

// check if a room exists.
const findRoom = (room_id, callback) => {
  connect(db => {
    db.collection(room_list).findOne({ room_id: room_id }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// creates a new room.
const createRoom = (room_name, callback) => {
  connect(db => {
    db.collection(room_list).insertOne({ room_id: room_name, room_name: room_name }, (err, item) => {
      if (err) return console.error(err);
      db.collection(room_layers).insertOne({ room_id: room_name, layer_name: "layer_0", z_index: 0 }, (err, item) => {
        if (err) return console.error(err);
        callback(item);
      });
    });
  });
};

// check if a layer for room exists.
const findLayer = (room_id, layer, callback) => {
  connect(db => {
    db.collection(room_layers).findOne({ room_id: room_id, layer_name: layer }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// gets the entire room.
const getRoom = (room_id, callback) => {
  connect(db => {
    db.collection(room_layers).aggregate([{ $match: { room_id: room_id } }, { $lookup: { from: room_points, localField: "layer_name", foreignField: "layer_name", as: "entries" } }]).toArray((err, items) => {
      let result = { room_id: room_id, layers: [] }
      items.forEach(layer => {
        let points = [];
        layer.entries.forEach(item => {
          points = points.concat(item.canvas.points);
        });
        if (points.length > 0) {
          points[0].push("start");
          points[points.length - 1].push("end");
        }
        let layer_result = { layer_name: layer.layer_name, canvas: { points: points, startIndex: 0 }, z_index: layer.z_index };
        result.layers.push(layer_result);
      });
      callback(result)
    });
  });
};

// updates the layer entries of a room and reorder all layers.
const updateLayer = (room_id, layer_name, new_name, new_z_index, callback) => {
  connect(db => {
    db.collection(room_layers).find({ room_id: room }, (err, items) => {
      if (err) return console.error(err);

    });
  });
};

// adds a new entry to a room.
const updateRoom = (room_id, canvas, layer_name, callback) => {
  connect(db => {
    // check if adding image.
    if (canvas.points[0][0] === "image") {
      // find and delete the existing image.

      console.log("image");
    }

    // remove the "start" and "end" from the points.
    if (canvas.points) {
      if (canvas.points[0][canvas.points[0].length-1] == "start") canvas.points[0].pop();
      if (canvas.points[canvas.points.length-1][canvas.points[canvas.points.length-1].length-1] == "end") canvas.points[canvas.points.length-1].pop();
    }
    db.collection('room_points').insertOne({ room_id: room_id, layer_name: layer_name, canvas: canvas }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// deletes the room and all layer and point entries.
const deleteRoom = (room_id, callback) => {
  console.log("delete", room_id);
  connect(db => {
    db.collection(room_list).deleteOne({ room_id: room_id }, (err, res) => {
      if (err) return console.error(err);
      if (res.deletedCount) console.log(`Deleted room '${room_id}'`);
    });
    db.collection(room_layers).deleteMany({ room_id: room_id }, (err, res) => {
      if (err) return console.error(err);
      if (res.deletedCount) console.log(`Deleted ${res.deletedCount} documents from '${room_layers}'.`);
    });
    db.collection(room_points).deleteMany({ room_id: room_id }, (err, res) => {
      if (err) return console.error(err);
      if (res.deletedCount) console.log(`Deleted ${res.deletedCount} documents from '${room_points}'.`);
    })
    callback();
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

  // join the room
  socket.on('joinroom', data => {
    socket.join(data.room_id);
    findRoom(data.room_id, (room) => {
      if (room) {
        getRoom(data.room_id, (item) => {
          console.log(item);
          return io.to(socket.id).emit("firstjoin", { room_id: item.room_id, layers: item.layers, room_name: room.room_name });
        });
      }
      else return io.to(socket.id).emit('redirect', { destination: '/index.html' });
    });
  });

  // create a new room
  socket.on('newroom', data => {
    let newroom = data.room_name;
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
    deleteRoom(data.room_id, () => {
      getRooms(room_list => {
        io.emit('listrooms', room_list);
        io.to(data.room_id).emit('redirect', { destination: '/index.html' });
      });
    });
  });

  // retrive canvas data from the remote user.
  socket.on('canvasupdate', data => {
    console.log(data);
    // send the update to all users in room.
    io.to(data.room_id).emit('canvasload', { room_id: data.room_id, layer_name: data.layer_name, canvas: data.canvas });
    // add the new canvas to the database.
    updateRoom(data.room_id, data.canvas, data.layer_name, (item) => {
    });
  });

  // retrive the layer data from the remote user.
  socket.on('layerupdate', data => {
    console.log(data);

  });

  socket.on('disconnect', () => {
    console.log('user disconnected from', socket.rooms);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});