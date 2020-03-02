(function () {

  const socket = io();

  document.addEventListener("click", e => {
    if (e.altKey) {
      let event = {
        clientX: e.clientX,
        clientY: e.clientY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
      }
      // send click location.
      socket.emit("mouse click", event);
    }
  });

  document.querySelector("#clear").addEventListener("click", e => {
    socket.emit("clear screen");
  });

  // create a point at location with listeners.
  let createElement = (msg) => {
    let d = document.createElement('div');
    d.style.position = "absolute";
    d.style.left = msg.msg.clientX+'px';
    d.style.top = msg.msg.clientY+'px';
    d.textContent  = msg.content;
    d.id  = "point_" + msg._id;
    d.addEventListener("click", e => {
      if (e.shiftKey) return socket.emit("shift click element", msg._id);
      socket.emit("click element", msg._id);
    });
    document.querySelector("#messages").append(d);
  };

  // clear page and add points.
  socket.on('load items' , msg => {
    document.querySelector("#messages").innerHTML = '';
    msg.forEach(item => {
      createElement(item);
    });
  });

  // create a new point.
  socket.on('mouse update', (msg) => {
    createElement(msg);
  });

  // update a point.
  socket.on('increment element' , msg => {
    document.querySelector(`#point_${msg._id}`).textContent = msg.content;
  });

  // delete a point.
  socket.on('delete element' , msg => {
    document.querySelector(`#point_${msg}`).remove();
  });

}());