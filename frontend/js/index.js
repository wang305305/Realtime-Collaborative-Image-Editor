(function () {

  const socket = io('/');
  socket.emit('getrooms');

  // enter a room
  document.querySelector("#button-addon2").addEventListener("click", e => {
    e.preventDefault();
    let room_id = document.querySelector("#enter_room_input").value;
    window.location.href = "/room/" + room_id;
  });

  // redirect to destination.
  socket.on('redirect', data => {
    window.location.href = data.destination;
  });

  // delete a room
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

  // input validation for room name
  document.querySelector("#next_button").addEventListener("click", e => {
    let room_name = document.querySelector("#room_name_input").value;
    if (!room_name || room_name === "") {
      socket.emit("error", "please enter a room name");
    } else {
      window.$('#createRoomModal').modal();
    }
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

  // set the focus to the text input field and to clear the field after the dialog closes
  window.$('#createPublic').on('click', () => {
    document.querySelector("#room_name_input").value = "";
    document.querySelector("#room_name_input").focus();
  });
  window.$('#closeModal').on('click', () => {
    document.querySelector("#room_name_input").value = "";
    document.querySelector("#room_name_input").focus();
  });
  window.$('#privateRoomModal').on('hidden.bs.modal', () => {
    document.querySelector("#room_name_input").value = "";
    document.querySelector("#room_name_input").focus();
  });
  window.$('#hiddenRoomModal').on('hidden.bs.modal', () => {
    document.querySelector("#room_name_input").value = "";
    document.querySelector("#room_name_input").focus();
  });

  // write an error message to the screen.
  socket.on('error', message => {
    const error_text = document.querySelector("#error_text");
    error_text.style.visibility = "visible";
    error_text.style.display = "block";
    error_text.innerHTML = message;
    setTimeout(() => {
      error_text.innerHTML = "";
      error_text.style.visibility = "hidden";
      error_text.style.display = "none";
    }, 5000);
  });

  // write an error message to the screen.
  socket.on('success', message => {
    const success_text = document.querySelector("#success_text");
    success_text.style.visibility = "visible";
    success_text.style.display = "block";
    success_text.innerHTML = message;
    setTimeout(() => {
      success_text.innerHTML = "";
      success_text.style.visibility = "hidden";
      success_text.style.display = "none";
    }, 5000);
  });

  // shows the new room id.
  socket.on('showID', id => {
    document.querySelector("#hidden_room_id").innerHTML = id;
    window.$('#hiddenRoomModal').modal();
  });

  // display the list of rooms.
  socket.on('listrooms', rooms => {
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
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
        li.querySelector('.room-id').addEventListener('keydown', (event) => {
          if (event.keyCode === 13) document.querySelector("#button-addon2").click();
          else if (event.keyCode === 8 || event.keyCode === 46) document.querySelector("#delete-button").click();
        });
        room_list.append(li);
      });
    }
  });
}());