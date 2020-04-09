(function () {

  const socket = io('/');
  socket.emit('getrooms');
  console.log("index js")

  // enter a room
  document.querySelector("#button-addon2").addEventListener("click", e => {
    e.preventDefault();
    let room_id = document.querySelector("#enter_room_input").value;
    window.location.href = "/room/" + room_id;
  });

  //delete a room
  document.querySelector("#delete-button").addEventListener("click", e => {
    e.preventDefault();
    let room_id = document.querySelector("#enter_room_input").value;
    document.querySelector("#enter_room_input").value = "";
    socket.emit("deleteroom", { room_id: room_id });
  });

  // create a new private room.
  document.querySelector("#createPrivate").addEventListener("click", e => {
    e.preventDefault();
    let room_name = document.querySelector("#room_name_input").value;
    let password = undefined;
    let hidden = false;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    hidden = document.querySelector("#hidden_option").checked;
    password = document.querySelector("#password_input").value;
    document.querySelector("#room_name_input").value = "";
    socket.emit("newroom", { room_name: room_name, password: password, hidden: hidden });
  });

  // create a new public room.
  document.querySelector("#createPublic").addEventListener("click", e => {
    e.preventDefault();
    let room_name = document.querySelector("#room_name_input").value;
    let password = undefined;
    let hidden = false;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    document.querySelector("#room_name_input").value = "";
    socket.emit("newroom", { room_name: room_name, password: password, hidden: hidden });
  });

  // write an error message to the screen.
  socket.on('error', message => {
    const error_text = document.querySelector("#error_text");
    error_text.style.visibility = "visible";
    error_text.innerHTML = message;
    error_text.classList.add("elementToFadeInAndOut");
    setTimeout(() => {
      error_text.style.visibility = "hidden";
    }, 5000);
  });

  // shows the new room id.
  socket.on('showID', id => {
    document.querySelector("#hidden_room_id").style.visibility = "visible";
    document.querySelector("#hidden_room_id").innerHTML = id;
  });

  // display the list of rooms.
  socket.on('listrooms', rooms => {
    const room_list_block = document.querySelector("#room_list_block");
    const room_list = document.querySelector("#room_list");
    const enter_room_input = document.querySelector("#enter_room_input");
    enter_room_input.innerHTML = "";
    room_list.innerHTML = ""
    if (rooms.length > 0) {
      room_list_block.style.visibility = "visible";
      rooms.forEach(room => {
        let li = document.createElement("li");
        li.className = "room-entry";
        li.innerHTML = `
        <button class="room-id btn btn-outline-secondary">${room.room_name}</button>`;
        li.querySelector('.room-id').addEventListener('click', () => {
          enter_room_input.value = room.room_id;
        });
        li.querySelector('.room-id').addEventListener('dblclick', () => {
          let room_id = document.querySelector("#enter_room_input").value;
          window.location.href = "/room/" + room_id;
        });
        room_list.append(li);
      });
    }
  });
}());