(function () {

  const socket = io('/');
  socket.emit('getrooms');
  console.log("index js")

  // create a new room.
  document.querySelector("#new_room_form").addEventListener("submit", e => {
    e.preventDefault();
    let room_name = document.querySelector("#room_name_input").value;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    socket.emit("newroom", { room_name: room_name});
  });

  // create a new private room.
  document.querySelector("#private_room_form").addEventListener("submit", e => {
    e.preventDefault();
    let room_name = document.querySelector("#private_room_name_input").value;
    let password = document.querySelector("#private_room_password").value;
    document.querySelector("#error_text").innerHTML = "";
    document.querySelector("#error_text").style.visibility = "hidden";
    socket.emit("newroom", { room_name: room_name, password: password});
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
        let li = document.createElement("li");
        li.className = "room-entry";
        li.innerHTML = `
        <a href="/room/${room.room_id}" class="room-link list-group-item">${room.room_name}</a>
        <button class="room-delete btn btn-secondary" title="delete this room">Delete</button>`;
        li.querySelector('.room-delete').addEventListener('click', function(e){
            socket.emit("deleteroom", { room_id: room.room_id });
        }); 
        room_list.append(li);
      });
      document.getElementById("new-room2").classList.add("col-6")
      document.getElementById("new-room2").style.marginRight = "5px";
      document.getElementById("new-room2").style.paddingRight = "27px";
      document.getElementById("new-room").classList.add("d-flex")
      document.getElementById("new-room").classList.add("justify-content-between")
    } else {
      room_list_block.style.visibility = "hidden";
      document.getElementById("new-room2").classList.remove("col-6")
      document.getElementById("new-room").classList.remove("d-flex")
      document.getElementById("new-room").classList.remove("justify-content-between")
    }
  });



}());