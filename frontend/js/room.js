(function () {

  const socket = io('/');

  const selected_layer = null;

  window.addEventListener('load', function () {

    socket.emit('joinroom', { room_id: window.location.pathname.split("/")[2] });

    document.querySelector("#layer_create").addEventListener("click", () => {
      console.log("create layer above", selected_layer);
    });

    document.querySelector("#layer_delete").addEventListener("click", () => {
      console.log("delete layer", selected_layer);
    });

    document.querySelector("#layer_duplicate").addEventListener("click", () => {
      console.log("duplicate layer", selected_layer);
    });

    document.querySelector("#layer_up").addEventListener("click", () => {
      console.log("move layer up", selected_layer);
    });

    document.querySelector("#layer_down").addEventListener("click", () => {
      console.log("move layer down", selected_layer);
    });
  });


  // first join the room.
  socket.on('firstjoin', data => {
    console.log('firstjoin', data);
    document.querySelector("#room_name").innerHTML = data.room_name + " Room";
    document.title = data.room_name + " Room - Realtime Collaborative Image Editor";
    setTimeout(() => {
      data.layers.forEach(layer => {
        // create layer and sync the data.
        const canvas_layer = designer_api.createLayer();
        console.log(layer);
        canvas_layer.designer.syncData(layer.canvas);

        // data passed back from the canvas
        canvas_layer.designer.addSyncListener(canvasData => {
          console.log(canvas_layer, canvasData);
          let syncData = { room_id: window.location.pathname.split("/")[2], layer_name: layer.layer_name, canvas: canvasData };
          socket.emit('canvasupdate', syncData);
        });
      });
    }, 300);
  });

  // redirect to index page.
  socket.on('redirect', data => {
    window.location.href = data.destination;
  });

  socket.on('layersload', data => {
    console.log('layersload', data);
  });

  // sync data
  socket.on('canvasload', data => {
    console.log('canvasload', data);
    designer_api.layers.find(layer => layer.layer_name === data.layer_name).designer.syncData(data.canvas);
  });

}());