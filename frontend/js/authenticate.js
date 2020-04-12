(function () {

  const socket = io('/');
  const room_id = new URLSearchParams(window.location.search).get('id');

  // submit password form to enter the room.
  document.querySelector("#password_form").addEventListener("submit", e => {
    e.preventDefault();
    let password = document.querySelector("#password_input").value;
    if (room_id) socket.emit("authenticate", { room_id: room_id, password: password });
    else window.location.href = "index.html";
  });

  // redirect to destination.
  socket.on('redirect', data => {
    window.location.href = data.destination;
  });

  // write an error message to the screen.
  socket.on('error', message => {
    const error_text = document.querySelector("#authenticate_error_text");
    error_text.style.visibility = "visible";
    error_text.style.display = "block";
    error_text.innerHTML = message;
    setTimeout(() => {
      error_text.innerHTML = "";
      error_text.style.visibility = "hidden";
      error_text.style.display = "none";
    }, 5000);
  });

}());