(function () {

  const socket = io('/');
  const room_id = new URLSearchParams(window.location.search).get('id');

  // create a new room.
  document.querySelector("#password_form").addEventListener("submit", e => {
    e.preventDefault();
    let password = document.querySelector("#password_input").value;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    if (room_id) socket.emit("authenticate", { room_id: room_id, password: password });
    else window.location.href = "index.html";
  });

  // redirect
  socket.on('redirect', data => {
    window.location.href = data.destination;
  });

  // error.
  socket.on('error', error => {
    console.log(error);
    document.querySelector("#error_text").style.visibility = "visible";
    document.querySelector("#error_text").innerHTML = error;
  });

}());