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
let connect = (callback) => {
  mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },(err, client) => {
    if (err) return console.log(err);
    callback(client.db(dbName));
  });
};

io.on('connection', socket => {
  console.log('a user connected');

  // init page.
  connect(db => {
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
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});