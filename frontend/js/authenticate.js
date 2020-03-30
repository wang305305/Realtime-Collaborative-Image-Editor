(function () {

  const socket = io('/');
  const temp = window.location.search;
  const urlParams = new URLSearchParams(temp);
  const room_id = urlParams.get('id');
  console.log("hello");
  // create a new room.
  document.querySelector("#password_form").addEventListener("submit", e => {
    e.preventDefault();
    let password = document.querySelector("#password_input").value;
    console.log(password, room_id);
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    socket.emit("authenticate", { room_id: room_id, password: password });
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