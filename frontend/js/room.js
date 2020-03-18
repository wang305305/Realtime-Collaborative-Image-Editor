(function () {

  const socket = io('/');


  const selected_layer = null;

  window.addEventListener('load', function () {

    socket.emit('joinroom', { room: window.location.pathname });

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


  // canvas designer
  const designer = designer_api.createLayer();
  const designer2 = designer_api.createLayer();
  const designer3 = designer_api.createLayer();
  

  // data passed back from the canvas
  designer.addSyncListener(canvasData => {
    let data = { room: window.location.pathname, canvas: canvasData }
    socket.emit('canvasupdate', data);
  });

  // first join the room.
  socket.on('firstjoin', data => {
    document.querySelector("#room_name").innerHTML = data.room + " Room";
    document.title = data.room + " Room - Realtime Collaborative Image Editor";
    setTimeout(() => {
      designer.syncData(data.canvas);
    }, 300);
  });

  // redirect to index page.
  socket.on('redirect', data => {
    window.location.href = data.destination;
  });

  // sync data
  socket.on('canvasload', data => {
    designer.syncData(data.canvas);
  });

}());