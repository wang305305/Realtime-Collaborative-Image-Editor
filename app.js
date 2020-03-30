const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const io = require('socket.io')(http);



const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const bcrypt = require('bcrypt');
const session = require('express-session')
const sharedsession = require("express-socket.io-session");
const ObjectID = require('mongodb').ObjectID;

let sessionMiddleware = session({
  secret: 'winston leo wayne',
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

io.use(sharedsession(sessionMiddleware), {
  autoSave: true
});

app.use(express.static('frontend'));

app.use((req, res, next) => {
  //use this array to store rooms that are authorized to current client
  if (req.session.authorized_rooms == undefined) {
    req.session.authorized_rooms = [];
  }
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
    db.collection(room_list).findOne({ _id: ObjectID(room_id) }, (err, item) => {
      if (err) return console.error(err);
      if (item && !item.private)
        return res.sendFile(__dirname + '/frontend/room.html');
      else if (item && item.private && req.session.authorized_rooms.includes(room_id))
        return res.sendFile(__dirname + '/frontend/room.html');
      else if (item && item.private && !req.session.authorized_rooms.includes(room_id))
        return res.redirect(`/authenticate.html?id=${room_id}`);
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
      let room_list = items.map(item => { return { room_id: item._id.toString(), room_name: item.room_name } });
      callback(room_list);
    });
  });
}

// check if a room name exists.
const findRoomName = (room_name, callback) => {
  connect(db => {
    db.collection(room_list).findOne({ room_name: room_name }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};


// check if a room id exists.
const findRoomId = (room_id, callback) => {
  connect(db => {
    db.collection(room_list).findOne({ _id: ObjectID(room_id) }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

//authenticate password
const is_authenticated = (room_id, password, callback) => {
  connect(db => {
    db.collection(room_list).findOne({ _id: ObjectID(room_id) }, (err, item) => {
      if (err) return console.error(err);
      bcrypt.compare(password, item.password, function (err, valid) {
        return callback(valid);
      });
    });
  });
};

// creates a new room.
const createRoom = (room_name, password, callback) => {
  if (password === undefined) {
    connect(db => {
      db.collection(room_list).insertOne({ room_name: room_name, private: false }, (err, item) => {
        if (err) return console.error(err);
        callback(item.ops[0]);
      });
    });
  }
  else {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        connect(db => {
          db.collection(room_list).insertOne({ room_name: room_name, password: hash, private: true }, (err, item) => {
            if (err) return console.error(err);
            callback(item.ops[0]);
          });
        });
      });
    });
  }
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
    db.collection(room_layers).aggregate([{ $match: { room_id: room_id } }, { $lookup: { from: room_points, localField: "layer_name", foreignField: "layer_name", as: "entries" } }]).sort({ "z_index": 1 }).toArray((err, items) => {
      if (err) return console.error(err);
      let result = { room_id: room_id, layers: [] }
      items.forEach(layer => {
        result.layers.push({
          layer_name: layer.layer_name,
          canvases: layer.entries.map(entry => entry.canvas),
          z_index: layer.z_index
        });
      });
      callback(result)
    });
  });
};

// creates a new layer.
const createLayer = (room_id, new_layer_name, callback) => {
  connect(db => {
    db.collection(room_layers).find({}).project({ z_index: 1 }).sort({ z_index: -1 }).limit(1).toArray((err, item) => {
      if (err) return console.error(err);
      let new_z_index = item[0] ? item[0].z_index + 1 : 0;
      db.collection(room_layers).insertOne({ room_id: room_id, layer_name: new_layer_name, z_index: new_z_index }, (err, item) => {
        callback(item.ops[0]);
      });
    });
  });
}

// deletes the layer.
const deleteLayer = (room_id, layer_name, callback) => {
  connect(db => {
    db.collection(room_points).deleteMany({ room_id: room_id, layer_name: layer_name }, (err, res) => {
      if (err) return console.error(err);
      if (res.deletedCount) console.log(`Deleted ${res.deletedCount} documents from '${room_points} in layer ${layer_name}'.`);
    });
    db.collection(room_layers).deleteOne({ room_id: room_id, layer_name: layer_name }, (err, res) => {
      if (err) return console.error(err);
      if (res.deletedCount) console.log(`Deleted ${res.deletedCount} documents from '${room_layers}'.`);
      // get the resulting layers z index.
      db.collection(room_layers).find({ room_id: room_id }).sort({ z_index: 1 }).toArray((err, items) => {
        // update the z_indexes.
        let ops = [];
        if (items.length > 0) {
          items.forEach((item, i) => {
            let op = {
              "updateOne": {
                "filter": { "_id": item._id },
                "update": { $set: { "z_index": i } }
              }
            }
            ops.push(op);
          });
          db.collection(room_layers).bulkWrite(ops, { "ordered": true, "w": 1 }, (err, res) => {
            if (err) return console.error(err);
            db.collection(room_layers).find({ room_id: room_id }).sort({ z_index: 1 }).toArray((err, items) => {
              if (err) return console.error(err);
              callback(items);
            });
          });
        }
        else {
          callback([]);
        }
      });
    });
  });
};

// duplicates the layer.
const duplicateLayer = (room_id, layer_name, new_layer_name, callback) => {
  connect(db => {
    db.collection(room_layers).find({}).project({ z_index: 1 }).sort({ z_index: -1 }).limit(1).toArray((err, item) => {
      if (err) return console.error(err);
      db.collection(room_points).find({ room_id: room_id, layer_name: layer_name }).project({ _id: 0 }).toArray((err, point_items) => {
        if (err) return console.error(err);
        db.collection(room_layers).insertOne({ room_id: room_id, layer_name: new_layer_name, z_index: item[0].z_index + 1 }, (err, new_layer_item) => {
          if (err) return console.error(err);
          let result = { room_id: room_id, layer_name: new_layer_name, canvases: [], z_index: item[0].z_index + 1 }
          if (point_items.length == 0) return callback(result);
          point_items = point_items.map(item => {
            return { room_id: room_id, layer_name: new_layer_name, canvas: item.canvas };
          });
          db.collection(room_points).insertMany(point_items, (err, new_point_items) => {
            if (err) return console.error(err);
            new_point_items.ops.forEach(item => {
              result.canvases.push(item.canvas);
            });
            callback(result);
          });
        });
      });
    });
  });
};

// moves the layer.
const moveLayer = (room_id, layer_name, direction, callback) => {
  connect(db => {
    db.collection(room_layers).find({ room_id: room_id }).sort({ z_index: 1 }).toArray((err, items) => {
      if (err) return console.error(err);
      let index = items.findIndex(item => item.layer_name === layer_name);
      if ((direction === 1 && index < items.length - 1) || (direction === -1 && index > 0)) {
        items[index + direction].z_index = index;
        items[index].z_index = index + direction;
        let ops = [
          {
            "updateOne": {
              "filter": { "_id": items[index]._id },
              "update": { $set: { "z_index": items[index].z_index } }
            }
          },
          {
            "updateOne": {
              "filter": { "_id": items[index + direction]._id },
              "update": { $set: { "z_index": items[index + direction].z_index } }
            }
          }
        ];
        db.collection(room_layers).bulkWrite(ops, { "ordered": true, "w": 1 }, (err, res) => {
          if (err) return console.error(err);
          db.collection(room_layers).find({ room_id: room_id }).sort({ z_index: 1 }).toArray((err, items) => {
            if (err) return console.error(err);
            callback(items);
          });
        });
      }
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
      if (canvas.points[0][canvas.points[0].length - 1] == "start") canvas.points[0].pop();
      if (canvas.points[canvas.points.length - 1][canvas.points[canvas.points.length - 1].length - 1] == "end") canvas.points[canvas.points.length - 1].pop();
    }
    db.collection('room_points').insertOne({ room_id: room_id, layer_name: layer_name, canvas: canvas }, (err, item) => {
      if (err) return console.error(err);
      callback(item);
    });
  });
};

// deletes the room and all layer and point entries.
const deleteRoom = (room_id, callback) => {
  connect(db => {
    db.collection(room_list).deleteOne({ _id: ObjectID(room_id) }, (err, res) => {
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
    findRoomId(data.room_id, (room) => {
      if (room) {
        getRoom(data.room_id, (item) => {
          return io.to(socket.id).emit("firstjoin", { room_id: item._id, layers: item.layers, room_name: room.room_name });
        });
      }
      else return io.to(socket.id).emit('redirect', { destination: '/index.html' });
    });
  });

  // authenticate private rooms
  socket.on('authenticate', data => {
    socket.join(data.room_id);
    is_authenticated(data.room_id, data.password, (result) => {
      if (result) {
        socket.handshake.session.authorized_rooms.push(data.room_id);
        socket.handshake.session.save();
        return io.to(socket.id).emit('redirect', { destination: `/room/${data.room_id}` });
      }
      else {
        return io.to(socket.id).emit('error', `password incorrect`);
      }
    });
  });

  // create a new room
  socket.on('newroom', data => {
    let room_name = data.room_name;
    let password = data.password;
    // check if room exists
    findRoomName(room_name, (item) => {
      if (item) return io.emit('error', `Room ${room_name} already exists.`);
      createRoom(room_name, password, () => {
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
    // send the update to all users in room.
    io.to(data.room_id).emit('canvasload', { room_id: data.room_id, layer_name: data.layer_name, canvas: data.canvas });
    // add the new canvas to the database.
    updateRoom(data.room_id, data.canvas, data.layer_name, (item) => {
    });
  });

  // create a new layer with name.
  socket.on('createlayer', data => {
    findLayer(data.room_id, data.new_layer_name, (item) => {
      if (item) return io.to(socket.id).emit('error', `The layer of name "${data.new_layer_name}" already exists.`);
      createLayer(data.room_id, data.new_layer_name, (item) => {
        io.to(data.room_id).emit('layerload', { room_id: item.room_id, layer_name: item.layer_name, z_index: item.z_index, mode: "create" });
      });
    })
  });

  // delete the layer with name and update z-index.
  socket.on('deletelayer', data => {
    findLayer(data.room_id, data.layer_name, (item) => {
      if (!item) return io.to(socket.id).emit('error', `The layer of name "${data.layer_name}" does not exist.`);
      deleteLayer(data.room_id, data.layer_name, (items) => {
        io.to(data.room_id).emit('layerload', { room_id: data.room_id, layer_name: data.layer_name, mode: "delete", layers: items });
      });
    });
  });

  // create new layer with same contents with new z-index.
  socket.on('duplicatelayer', data => {
    findLayer(data.room_id, data.layer_name, (item) => {
      if (!item) return io.to(socket.id).emit('error', `The layer of name "${data.layer_name}" does not exist.`);
      duplicateLayer(data.room_id, data.layer_name, data.new_layer_name, (item) => {
        io.to(data.room_id).emit('layerload', { room_id: item.room_id, layer_name: item.layer_name, z_index: item.z_index, mode: "duplicate", canvases: item.canvases });
      });
    });
  });

  // swap the layer with it's neighbour in the direction.
  socket.on('movelayer', data => {
    findLayer(data.room_id, data.layer_name, (item) => {
      if (!item) return io.to(socket.id).emit('error', `The layer of name "${data.layer_name}" does not exist.`);
      moveLayer(data.room_id, data.layer_name, data.direction, (items) => {
        io.to(data.room_id).emit('layerload', { room_id: data.room_id, layer_name: data.layer_name, mode: "move", direction: data.direction, layers: items });
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});