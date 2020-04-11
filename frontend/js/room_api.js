const room_api = (function () {

  let module = {};

  module.layers = [];

  module.selected_layer = {};

  module.createLayer = (layer_name = `layer_${module.layers.length}`, z_index = module.layers.length, selected = false, load = false) => {
    let new_layer = { layer_name: layer_name, z_index: z_index, selected: selected };
    // create the new canvas designer.
    new_layer.designer = new CanvasDesigner();
    new_layer.designer.widgetHtmlURL = '/widget.html';
    new_layer.designer.widgetJsURL = '/js/a.js';
    new_layer.designer.setTools({
      line: true,
      arrow: true,
      pencil: true,
      marker: true,
      dragSingle: false,
      dragMultiple: false,
      eraser: true,
      rectangle: true,
      arc: true,
      bezier: false,
      quadratic: false,
      text: false,
      image: false,
      pdf: false,
      zoom: false,
      lineWidth: true,
      colorsPicker: true,
      extraOptions: false,
      code: true,
      undo: false
    });

    // add canvas designer to the page.
    const designer_layers = document.querySelector("#designer_layers")
    const canvas_layer = document.createElement("div");
    canvas_layer.classList.add("canvas_layer");
    canvas_layer.setAttribute("layer_name", layer_name);
    canvas_layer.style.zIndex = z_index;
    new_layer.canvas_layer = canvas_layer;
    designer_layers.prepend(canvas_layer);

    // add layer to the layer panel list.
    const layer_panel_list = document.querySelector("#layer_panel_list");
    const layer_list_row = document.createElement("div");
    layer_list_row.classList.add("layer_list_row");
    layer_list_row.innerHTML = `
    <div class="layer_element" layer_name="${layer_name}">${layer_name}</div>
    <i class="fa fa-eye eye fa-2x" aria-hidden="true" style="padding-top:5px;"></i>`
    new_layer.layer_list_row = layer_list_row;
    layer_panel_list.prepend(layer_list_row);

    // add listener to the layer element.
    layer_list_row.querySelector(".layer_element").addEventListener("click", () => {
      module.selectLayer(layer_name);
    });

    // add listener to the layer visibilility button.
    const vis_toggle = layer_list_row.querySelector(".eye");
    vis_toggle.addEventListener("click", () => {
      if (canvas_layer.classList.contains("hidden")) {
        vis_toggle.classList.remove('fa-eye-slash');
        vis_toggle.classList.add('fa-eye');
        canvas_layer.classList.remove("hidden");
      }
      else {
        vis_toggle.classList.remove('fa-eye');
        vis_toggle.classList.add('fa-eye-slash');
        canvas_layer.classList.add("hidden");
      }
    });

    new_layer.designer.appendTo(canvas_layer);
    module.layers.push(new_layer);
    if (selected) module.selectLayer(layer_name);
    return new_layer;
  };

  // selects the layer layer_name.
  module.selectLayer = (layer_name) => {
    // don't reselect.
    if (module.selected_layer.layer_name === layer_name) return;

    // deselect all other layers.
    document.querySelectorAll(".layer_element").forEach(element => {
      if (element.classList.contains("selected")) element.classList.remove("selected");
    });

    // select element and update variable.
    document.querySelector(`.layer_element[layer_name="${layer_name}"]`).classList.add("selected");
    module.selected_layer = module.layers.find(layer => layer.layer_name === layer_name);
  };

  // deletes the layer layer_name and updates the z-indexes with new_layers.
  module.deleteLayer = (layer_name, new_layers) => {
    const index = module.layers.findIndex(layer => layer.layer_name === layer_name);
    if (index === -1) return console.error(`Cannot delete. Layer ${layer_name} not found.`);
    const delete_layer = module.layers[index];

    // delete the layer.
    delete_layer.canvas_layer.remove();
    delete_layer.layer_list_row.remove();
    module.layers.splice(index, 1);

    // update the z index.
    module.layers.forEach(layer => {
      new_layers.forEach(layer_new => {
        if (layer_new.layer_name === layer.layer_name) {
          layer.canvas_layer.style.zIndex = layer_new.z_index;
        }
      });
    });
    if (module.layers.length > 0) {
      // change the selected layer if currently selected deleted.
      if (module.selected_layer.layer_name === layer_name) {
        if (index == module.layers.length && module.layers.length > 0) {
          module.selectLayer(module.layers[index - 1].layer_name);
        } else {
          module.selectLayer(module.layers[0].layer_name);
        }
      }
    } else module.selected_layer = {};
  };

  // moves the position of layer layer_name in direction direction and updates the z-indexes with new_layers.
  module.moveLayer = (layer_name, direction, new_layers) => {
    // get the two layers to swap.
    const index = module.layers.findIndex(layer => layer.layer_name === layer_name);
    const other_index = index + direction;

    // swap the list elments.
    if (index < other_index) module.layers[index].layer_list_row.parentNode.insertBefore(module.layers[index].layer_list_row, module.layers[other_index].layer_list_row);
    else if (index > other_index) module.layers[index].layer_list_row.parentNode.insertBefore(module.layers[other_index].layer_list_row, module.layers[index].layer_list_row);

    // swap the layers list elements.
    let temp = module.layers[index];
    module.layers[index] = module.layers[other_index];
    module.layers[other_index] = temp;

    // update the z index.
    module.layers.forEach(layer => {
      new_layers.forEach(layer_new => {
        if (layer_new.layer_name === layer.layer_name) {
          layer.canvas_layer.style.zIndex = layer_new.z_index;
        }
      });
    });
  };

  return module;
}());