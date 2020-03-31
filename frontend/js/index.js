(function () {

  const socket = io('/');
  socket.emit('getrooms');
  console.log("index js")

  // create a new room.
  document.querySelector("#new_room_form").addEventListener("submit", e => {
    e.preventDefault();
    let room_name = document.querySelector("#room_name_input").value;
    let password = undefined;
    let hidden = false;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    let private_checkbox = document.querySelector("#private_option").checked;
    hidden = document.querySelector("#hidden_option").checked;
    if (private_checkbox) password = document.querySelector("#password_input").value;
    socket.emit("newroom", { room_name: room_name, password: password, hidden:hidden});
  });

  document.querySelector("#private_option").addEventListener('change', function() {
    if(this.checked) {
      document.querySelector("#password_label").style.visibility = "visible";
      document.querySelector("#password_input").style.visibility = "visible";
      document.querySelector("#hidden_option").style.visibility = "visible";
      document.querySelector("#hidden_label").style.visibility = "visible";
    } else {
      document.querySelector("#password_label").style.visibility = "hidden";
      document.querySelector("#password_input").style.visibility = "hidden";
      document.querySelector("#hidden_option").style.visibility = "hidden";
      document.querySelector("#hidden_label").style.visibility = "hidden";
    }
  });

  // error.
  socket.on('error', error => {
    console.log(error);
    document.querySelector("#error_text").style.visibility = "visible";
    document.querySelector("#error_text").innerHTML = error;
  });

  socket.on('showID', id => {
    console.log(id);
    document.querySelector("#hidden_room_id").style.visibility = "visible";
    document.querySelector("#hidden_room_id").innerHTML = id;
  });

  // display rooms.
  socket.on('listrooms', rooms => {
    const room_list_block = document.querySelector("#room_list_block");
    const room_list = document.querySelector("#room_list");
    room_list.innerHTML = ""
    if (rooms.length > 0) {
      room_list_block.style.visibility = "visible";
      rooms.forEach(room => {
        console.log(room);
        let div = document.createElement("div");
        div.className = "room-entry";
        div.innerHTML = `
        <a href="/room/${room.room_id}" class="room-link">${room.room_name}</a>
        <button class="room-delete delete-icon" title="delete this room"></button>`;
        div.querySelector('.room-delete').addEventListener('click', function(e){
            socket.emit("deleteroom", { room_id: room.room_id });
        });
        room_list.append(div);
      });
    } else {
      room_list_block.style.visibility = "hidden";
    }
  });



}());