(function () {

  const socket = io('/');
  socket.emit('joinroom', {room: window.location.pathname});

  const designer = new CanvasDesigner();

  window.addEventListener('load', function(){
    
    let canvas = document.getElementById("drawing");
    let ctx = canvas.getContext('2d');
    ctx.font = '30px Impact'
    ctx.rotate(0.1)
    ctx.fillText('Awesome!', 50, 100)

    var text = ctx.measureText('Awesome!')
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.lineTo(50, 102)
    ctx.lineTo(50 + text.width, 102)
    ctx.stroke()

    // canvas designer
    designer.widgetHtmlURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.html'; 
    designer.widgetJsURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.js';
    let designer_container = document.getElementById("designer");
    designer.appendTo(designer_container);
    designer.iframe.style.border = '5px solid black';
    designer.iframe.height = "500";
    designer.iframe.width = "500";

  });

  // data passed back from the canvas
  designer.addSyncListener(data => {
    console.log("addSyncListener", {room: window.location.pathname, canvas: data});
    socket.emit('canvasupdate', {room: window.location.pathname, canvas: data});
  });

  // first join the room.
  socket.on('firstjoin', data => {
    console.log("firstjoin", data);
    document.querySelector("#room_name").innerHTML = data.room + " Room";
    designer.syncData(data.canvas);
  });

  // redirect to index page.
  socket.on('redirect', data => {
    window.location.href = data.destination;
  });

  // sync data
  socket.on('canvasload', data => {
    console.log("canvasload", data);
    designer.syncData(data.canvas);
  });

}());