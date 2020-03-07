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

const mongo  = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'test';
const ObjectId = require('mongodb').ObjectId

// Connect using MongoClient
const connect = (callback) => {
  mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },(err, client) => {
    if (err) return console.log(err);
    callback(client.db(dbName));
  });
};

// connect to room, redirect if room doesn't exist.
app.get("/:room", (req, res, next) => {
  let room = `/${req.params.room}`;
  connect(db => {
    db.collection('rooms').findOne({room_id: room}, (err, item) => {
      if (err) return console.log(err);
      console.log("connect to room");
      if (item) return res.sendFile(__dirname + '/frontend/room.html');
      else return res.redirect('/index.html');
    });
  });
});

// redirect to room select page.
app.get("/", (req, res, next) => {
  console.log("root");
  res.sendFile(__dirname + '/frontend/index.html');
});

const getRooms = (callback) => {
  connect(db => {
    db.collection('rooms').find({}, {_id: 0, canvas: 0}).toArray((err, items) => {
      if (err) return console.log(err);
      let room_list = items.map(item => item.room_id);
      callback(room_list);
    });
  });
}

const findRoom = (room, callback) => {
  connect(db => {
    db.collection('rooms').findOne({room_id: room}, (err, item) => {
      if (err) return console.log(err);
      callback(item);
    });
  });
};

const createRoom = (room, callback) => {
  connect(db => {
    db.collection('rooms').insertOne({room_id: room, canvas: ""}, (err, item) => {
      if (err) return console.log(err);
      callback(item);
    });
  });
};

const updateRoom = (room, canvas, callback) => {
  connect(db => {
    db.collection('rooms').findOneAndUpdate({room_id: room}, {$set: {canvas: canvas}}, { returnOriginal: false }, (err, item) => {
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
    console.log(socket.id, "joined", data.room);
    findRoom(data.room, (item) => {
      if (item) return io.to(socket.id).emit("firstjoin", {room: item.room_id, canvas: item.canvas});
      else return io.to(socket.id).emit('redirect', {destination: '/index.html'});
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
    updateRoom(data.room, data.canvas, (item) => {
      io.to(data.room).emit('canvasload', {room: item.value.room, canvas: item.value.canvas});
    })
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected from', socket.rooms);
  });

  // init page.
  /*connect(db => {
    db.collection('points').find().toArray((err, items) => {
      io.emit("load items", items);
    })
  });

  // add a new point
  socket.on('mouse click', msg => {
    connect(db => {
      db.collection('points').insertOne({msg, content:0}, (err, result) => {
        if (err) return console.log(err);
        let item = result.ops[0];
        // update all clients with new point.
        io.emit("mouse update", item);
      });
    });
  }); 

  // delete point.
  socket.on('shift click element', msg => {
    connect(db => {
      db.collection('points').deleteOne({_id: ObjectId(msg)}, (err, item) => {
        if (err) return console.log(err);
        if (!item) return console.log("no item");
        // delete point from all clients.
        io.emit("delete element", msg);
      });
    });
  }); 
  
  // update a point.
  socket.on('click element', msg => {
    connect(db => {
      db.collection('points').findOneAndUpdate({_id: ObjectId(msg)}, {$inc: {content: 1}}, { returnOriginal: false }, (err, item) => {
        if (err) return console.log(err);
        if (!item) return console.log("no item");
        // update all clients with new point value.
        io.emit("increment element", item.value);
      });
    });
  }); 

  // delete all points
  socket.on('clear screen', () => {
    connect(db => {
      db.collection('points').deleteMany({}, (err, result) => {
        if (err) return console.log(err);
        // load screen with no items.
        io.emit("load items", []);
      });
    });
  });*/
});

const PORT = 3000;

http.listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});