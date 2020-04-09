(function () {

  const socket = io('/');
  socket.emit('getrooms');
  console.log("index js")

  // enter a room

  document.querySelector("#button-addon2").addEventListener("click", e => {
    e.preventDefault();
    let room_id = document.querySelector("#enter_room_input").value;
    window.location.href="/room/"+room_id;
  });

  //delete a room
  document.querySelector("#delete-button").addEventListener("click", e => {
    e.preventDefault();
    let room_id = document.querySelector("#enter_room_input").value;
    socket.emit("deleteroom", { room_id: room_id });
  });

  // create a new private room.
  document.querySelector("#createPrivate").addEventListener("click", e => {
    //console.log("create private")
    e.preventDefault();
    let room_name = document.querySelector("#room_name_input").value;
    let password = undefined;
    let hidden = false;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    //let private_checkbox = document.querySelector("#private_option").checked;
    hidden = document.querySelector("#hidden_option").checked;
    password = document.querySelector("#password_input").value;
    console.log("will emit " + { room_name: room_name, password: password, hidden: hidden })
    socket.emit("newroom", { room_name: room_name, password: password, hidden: hidden });
  });

  // create a new public room.
  document.querySelector("#createPublic").addEventListener("click", e => {
    //console.log("create public")
    e.preventDefault();
    let room_name = document.querySelector("#room_name_input").value;
    let password = undefined;
    let hidden = false;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    socket.emit("newroom", { room_name: room_name, password: password, hidden: hidden });
  });
  /*
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
  */
  // error.
  socket.on('error', error => {
    alert(error);
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
        let li = document.createElement("li");
        li.className = "room-entry";
        li.innerHTML = `
        <button class="room-id btn btn-outline-secondary">${room.room_name}</button>`;
        li.querySelector('.room-id').addEventListener('click', function (e) {
          document.querySelector("#enter_room_input").value = room.room_id;
        });
        room_list.append(li);
      });

    }
  });



}());