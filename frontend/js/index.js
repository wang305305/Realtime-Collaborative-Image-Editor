(function () {

  const socket = io('/');
  socket.emit('getrooms');


  document.querySelector("#new_room_form").addEventListener("submit", e => {
    e.preventDefault();
    let room = document.querySelector("#room_name_input").value;
    socket.emit("newroom", { room: room });
  });



  // display rooms.
  socket.on('listrooms', rooms => {
    const room_list = document.querySelector("#room_list");
    room_list.innerHTML = "";
    rooms.forEach(room => {
      let p = document.createElement("p");
      let a = document.createElement("a");
      a.setAttribute("href", `${room}`);
      a.innerHTML = room;
      p.append(a);

      let element = document.createElement('div');
      element.className = "delete";
      element.innerHTML = `
          <button class="delete-icon icon">delete</button>
      `;
      element.querySelector('.delete-icon').addEventListener('click', function(e){
          socket.emit("deleteroom", { room: room });
      }); 
      p.append(element);
      room_list.append(p);
    });
  });



}());