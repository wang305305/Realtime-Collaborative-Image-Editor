(function () {

  const socket = io('/');

  const room_id = window.location.pathname.split("/")[2];

  window.addEventListener('load', function () {
    // join the room on load.
    socket.emit('joinroom', { room_id: room_id });

    // move layer events.
    options = { animation: 150 };
    events = ['onEnd'].forEach(function (name) {
      options[name] = function (evt) {
        let layer_name = evt.item.innerText;
        let oldIndex = evt.oldIndex;
        let newIndex = evt.newIndex;
        let steps = Math.abs(oldIndex - newIndex);
        if (oldIndex > newIndex) {
          for (var i = 0; i < steps; i++) {
            socket.emit('movelayer', { room_id: room_id, layer_name: layer_name, direction: 1 })
          }
        } else if (oldIndex < newIndex) {
          for (var i = 0; i < steps; i++) {
            socket.emit('movelayer', { room_id: room_id, layer_name: layer_name, direction: -1 })
          }
        }
      };
    });

    // create draggable list
    Sortable.create(layer_panel_list, options);

    // add event listener for create layer
    document.querySelector("#create_layer").addEventListener("click", () => {
      let new_layer_name = document.querySelector("#layer_name_input").value
      if (new_layer_name) socket.emit('createlayer', { room_id: room_id, new_layer_name: new_layer_name })
    });

    // add event listener for layer_delete button.
    document.querySelector("#layer_delete").addEventListener("click", () => {
      if (Object.keys(room_api.selected_layer).length == 0) {
        socket.emit("error", "No layer selected to delete");
        return;
      };
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (layer_name) socket.emit('deletelayer', { room_id: room_id, layer_name: layer_name })
    });

    // add event listener for layer_duplicate button.
    document.querySelector("#layer_duplicate").addEventListener("click", () => {
      if (Object.keys(room_api.selected_layer).length == 0) {
        socket.emit("error", "No layer selected to duplicate");
        return;
      };
      let new_layer_name = prompt("New Layer Name");
      let layer_name = room_api.selected_layer.canvas_layer.getAttribute("layer_name");
      if (new_layer_name) socket.emit('duplicatelayer', { room_id: room_id, layer_name: layer_name, new_layer_name: new_layer_name })
    });
  });

  // set the focus to the text input field and to clear the field after the dialog closes
  window.$('#createLayerModal').on('shown.bs.modal', function (e) {
    document.querySelector("#layer_name_input").value = "";
    document.querySelector("#layer_name_input").focus();
  });

  // first join the room.
  socket.on('firstjoin', data => {
    console.log("on firstjoin")
    document.querySelector("#room_name").innerHTML = data.room_name + " Room";
    document.title = data.room_name + " Room - Realtime Collaborative Image Editor";
    data.layers.forEach((layer, i) => {
      // create layer and sync the data.
      console.log("room_api.createLayer called in firstjoin")
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

  // write an error message to the screen.
  socket.on('error', message => {
    const error_text = document.querySelector("#room_error_text");
    error_text.style.visibility = "visible";
    error_text.innerHTML = message;
  });

  // sync layers
  socket.on('layerload', data => {
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
    room_api.layers.find(layer => layer.layer_name === data.layer_name).designer.syncData(data.canvas);
  });

}());