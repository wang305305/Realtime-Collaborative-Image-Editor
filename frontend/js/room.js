(function () {

  const socket = io('/');

  const selected_layer = null;

  const room_id = window.location.pathname.split("/")[2];

  window.addEventListener('load', function () {

    socket.emit('joinroom', { room_id: room_id });

    document.querySelector("#layer_create").addEventListener("click", () => {
      let new_layer_name = prompt("New Layer Name");
      if (new_layer_name) socket.emit('createlayer', { room_id: room_id, new_layer_name: new_layer_name })
    });

    document.querySelector("#layer_delete").addEventListener("click", () => {
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (layer_name) socket.emit('deletelayer', { room_id: room_id, layer_name: layer_name })
    });

    document.querySelector("#layer_duplicate").addEventListener("click", () => {
      let new_layer_name = prompt("New Layer Name");
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (new_layer_name) socket.emit('duplicatelayer', { room_id: room_id, layer_name: layer_name, new_layer_name: new_layer_name })
    });

    document.querySelector("#layer_up").addEventListener("click", () => {
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (layer_name) socket.emit('moveuplayer', { room_id: room_id, layer_name: layer_name })
    });

    document.querySelector("#layer_down").addEventListener("click", () => {
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (layer_name) socket.emit('movedownlayer', { room_id: room_id, layer_name: layer_name })
    });
  });

  // first join the room.
  socket.on('firstjoin', data => {
    // console.log('firstjoin', data);
    document.querySelector("#room_name").innerHTML = data.room_name + " Room";
    document.title = data.room_name + " Room - Realtime Collaborative Image Editor";
    
    data.layers.forEach((layer, i) => {
      console.log(layer.layer_name, layer.canvases.length);
      // create layer and sync the data.
      const new_layer = room_api.createLayer(layer.layer_name, layer.z_index, data.layers.length == i + 1 ? true : false);
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
    console.log('layerload', data);
    if (data.mode === "create") {
      const new_layer = room_api.createLayer(data.layer_name, data.z_index);
      new_layer.designer.addSyncListener(canvasData => {
        if (new_layer.canvas_layer.getAttribute("layer_name") === room_api.selected_layer.canvas_layer.getAttribute("layer_name")) {
          let syncData = { room_id: room_id, layer_name: data.layer_name, canvas: canvasData };          
          socket.emit('canvasupdate', syncData);
        }
      });
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
        if (new_layer.canvas_layer.getAttribute("layer_name") === room_api.selected_layer.canvas_layer.getAttribute("layer_name")) {
          let syncData = { room_id: room_id, layer_name: data.layer_name, canvas: canvasData };          
          socket.emit('canvasupdate', syncData);
        }
      });

    }
    else if (data.mode === "update") {
      
    }
    else if (data.mode === "delete") {
   
    }
    else if (data.mode === "replace") {

    }
  });

  // sync data
  socket.on('canvasload', data => {
    // console.log('canvasload', data);
    room_api.layers.find(layer => layer.canvas_layer.getAttribute("layer_name") === data.layer_name).designer.syncData(data.canvas);
  });

  socket.on('error', data => {
    console.error(data);
    alert(data);
  });

  String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

}());