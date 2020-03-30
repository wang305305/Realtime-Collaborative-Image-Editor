(function () {

  const socket = io('/');

  const room_id = window.location.pathname.split("/")[2];

  window.addEventListener('load', function () {

    Sortable.create(layer_panel_list, {
      animation: 150,
    });

    socket.emit('joinroom', { room_id: room_id });

    document.querySelector("#layer_create").addEventListener("click", () => {
      let new_layer_name = prompt("New Layer Name");
      if (new_layer_name) socket.emit('createlayer', { room_id: room_id, new_layer_name: new_layer_name })
    });

    document.querySelector("#layer_delete").addEventListener("click", () => {
      //console.log(Object.keys(room_api.selected_layer).length);
      if (Object.keys(room_api.selected_layer).length == 0) {
        console.log("No selected layer to delete");
        return;
      };
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (layer_name) socket.emit('deletelayer', { room_id: room_id, layer_name: layer_name })
    });

    document.querySelector("#layer_duplicate").addEventListener("click", () => {
      if (Object.keys(room_api.selected_layer).length == 0) {
        console.log("No selected layer to duplicate");
        return;
      };
      let new_layer_name = prompt("New Layer Name");
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (new_layer_name) socket.emit('duplicatelayer', { room_id: room_id, layer_name: layer_name, new_layer_name: new_layer_name })
    });
/*
    document.querySelector("#layer_up").addEventListener("click", () => {
      if (Object.keys(room_api.selected_layer).length == 0) {
        console.log("No selected layer to move up");
        return;
      };
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      let index = room_api.layers.findIndex(layer => layer.layer_name === layer_name);
      if (index >= room_api.layers.length - 1) {
        console.error("Cannot move first layer up.");
        alert("Cannot move first layer up.");
        return;
      }
      if (layer_name) socket.emit('movelayer', { room_id: room_id, layer_name: layer_name, direction: 1 })
    });

    document.querySelector("#layer_down").addEventListener("click", () => {
      if (Object.keys(room_api.selected_layer).length == 0) {
        console.log("No selected layer to move down");
        return;
      };
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      let index = room_api.layers.findIndex(layer => layer.layer_name === layer_name);
      if (index <= 0) {
        console.error("Cannot move last layer down.");
        alert("Cannot move last layer down.");
        return;
      }
      if (layer_name) socket.emit('movelayer', { room_id: room_id, layer_name: layer_name, direction: -1 })
    });*/
  });

  // first join the room.
  socket.on('firstjoin', data => {
    document.querySelector("#room_name").innerHTML = data.room_name + " Room";
    document.title = data.room_name + " Room - Realtime Collaborative Image Editor";
    data.layers.forEach((layer, i) => {
      // create layer and sync the data.
      const new_layer = room_api.createLayer(layer.layer_name, layer.z_index, i == 0, true);
      // sync the points to the canvas layer.
      setTimeout(() => {
        layer.canvases.forEach(canvas => {
          new_layer.designer.syncData(canvas);
        });
      }, 500);

      // data passed back from the canvas
      new_layer.designer.addSyncListener(canvasData => {
        if (new_layer.canvas_layer.getAttribute("layer_name") === room_api.selected_layer.canvas_layer.getAttribute("layer_name")) {
          let syncData = { room_id: room_id, layer_name: layer.layer_name, canvas: canvasData };
          socket.emit('canvasupdate', syncData);
        }
      });
    });
  });

  // redirect to index page.
  socket.on('redirect', data => {
    window.location.href = data.destination;
  });

  // sync layers
  socket.on('layerload', data => {
    // console.log('layerload', data);
    if (data.mode === "create") {
      // create a new layer.
      const new_layer = room_api.createLayer(data.layer_name, data.z_index);
      // add the listener to the layer.
      new_layer.designer.addSyncListener(canvasData => {
        if (new_layer.canvas_layer.getAttribute("layer_name") === room_api.selected_layer.canvas_layer.getAttribute("layer_name")) {
          let syncData = { room_id: room_id, layer_name: data.layer_name, canvas: canvasData };
          socket.emit('canvasupdate', syncData);
        }
      });
      // select the new layer if it is the only one.
      if (room_api.layers.length == 1) {
        room_api.selectLayer(data.layer_name);
      }
    }

    else if (data.mode === "delete") {
      room_api.deleteLayer(data.layer_name, data.layers);
    }

    else if (data.mode === "duplicate") {
      const new_layer = room_api.createLayer(data.layer_name, data.z_index);
      // sync the points to the canvas layer.
      setTimeout(() => {
        data.canvases.forEach(canvas => {
          new_layer.designer.syncData(canvas);
        });
      }, 500);
      new_layer.designer.addSyncListener(canvasData => {
        if (new_layer.layer_name === room_api.selected_layer.layer_name) {
          let syncData = { room_id: room_id, layer_name: data.layer_name, canvas: canvasData };
          socket.emit('canvasupdate', syncData);
        }
      });
    }

    else if (data.mode === "move") {
      room_api.moveLayer(data.layer_name, data.direction, data.layers);
    }
  });

  // sync data
  socket.on('canvasload', data => {
    // console.log('canvasload', data);
    room_api.layers.find(layer => layer.layer_name === data.layer_name).designer.syncData(data.canvas);
  });

  socket.on('error', data => {
    console.error(data);
    alert(data);
  });

  String.prototype.hashCode = function () {
    var hash = 0;
    if (this.length == 0) {
      return hash;
    }
    for (var i = 0; i < this.length; i++) {
      var char = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

}());