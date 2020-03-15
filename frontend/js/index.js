(function () {

  const socket = io('/');
  socket.emit('getrooms');

  // create a new room.
  document.querySelector("#new_room_form").addEventListener("submit", e => {
    e.preventDefault();
    let room = document.querySelector("#room_name_input").value;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    socket.emit("newroom", { room: room });
  });

  // error.
  socket.on('error', error => {
    console.log(error);
    document.querySelector("#error_text").style.visibility = "visible";
    document.querySelector("#error_text").innerHTML = error;
  });

  // display rooms.
  socket.on('listrooms', rooms => {
    const room_list_block = document.querySelector("#room_list_block");
    const room_list = document.querySelector("#room_list");
    room_list.innerHTML = ""
    if (rooms.length > 0) {
      room_list_block.style.visibility = "visible";
      rooms.forEach(room => {
        let div = document.createElement("div");
        div.className = "room-entry";
        div.innerHTML = `
        <a href="${room}" class="room-link">${room}</a>
        <button class="room-delete delete-icon" title="delete this room"></button>`;
        div.querySelector('.room-delete').addEventListener('click', function(e){
            socket.emit("deleteroom", { room: room });
        }); 
        room_list.append(div);
      });
    } else {
      room_list_block.style.visibility = "hidden";
    }
  });



}());