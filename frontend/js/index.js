(function () {

  const socket = io();
  let designer = new CanvasDesigner();

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

    //canvas designer
    //let designer = new CanvasDesigner();
    designer.widgetHtmlURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.html'; 
    designer.widgetJsURL = 'https://cdn.webrtc-experiment.com/Canvas-Designer/widget.js';
    let designer_container = document.getElementById("designer");
    designer.appendTo(designer_container);
    designer.iframe.style.border = '5px solid red';
    designer.iframe.height = "500";
    designer.iframe.width = "500";

  });

  // clear page and add points.
  /*socket.on('load items' , msg => {
    document.querySelector("#messages").innerHTML = '';
    msg.forEach(item => {
      createElement(item);
    });
  });*/

  //data passed back from the canvas
  designer.addSyncListener(function(data) {
    socket.emit('message', data);
  });

  //sync data
  socket.on('message', function(data) {
    designer.syncData(data);
  });

}());