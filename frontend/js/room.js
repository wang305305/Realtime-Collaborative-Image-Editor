(function () {

  const socket = io('/');

  const designer = new CanvasDesigner();

  window.addEventListener('load', function () {

    // canvas designer
    designer.widgetHtmlURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.html'; 
    designer.widgetJsURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.js';
    // designer.widgetHtmlURL = '/widget.html';
    // designer.widgetJsURL = '/js/a.js';
    let designer_container = document.getElementById("designer");
    designer.appendTo(designer_container);
    designer.iframe.style.border = '5px solid black';
    designer.iframe.height = "500";
    designer.iframe.width = "500";

    socket.emit('joinroom', { room: window.location.pathname });

  });

  // data passed back from the canvas
  designer.addSyncListener(canvasData => {
    let data = { room: window.location.pathname, canvas: canvasData }
    socket.emit('canvasupdate', data);
  });

  // first join the room.
  socket.on('firstjoin', data => {
    console.log(data);
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