const room_api = (function () {

  let module = {};

  module.layers = [];

  module.selected_layer = { canvas_layer: null, layer_list_row: null };

  module.createLayer = (layer_name = `layer_${module.layers.length}`, z_index = module.layers.length, select=false) => {
    let new_layer = {};
    // create the new canvase designer.
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
      text: true,
      image: true,
      pdf: false,
      zoom: false,
      lineWidth: true,
      colorsPicker: true,
      extraOptions: true,
      code: true,
      undo: false
    })

    // add canvas designer to the page.
    let designer_layers = document.querySelector("#designer_layers")
    let canvas_layer = document.createElement("div");
    canvas_layer.classList.add("canvas_layer");
    canvas_layer.setAttribute("layer_name", layer_name);
    canvas_layer.setAttribute("z_index", z_index);
    new_layer.canvas_layer = canvas_layer;
    designer_layers.append(canvas_layer);

    // layer to the layer panel list.
    let layer_list_row = document.createElement("div");
    layer_list_row.classList.add("layer_list_row");
    layer_list_row.innerHTML = `
    <div class="layer_element" layer_name="${layer_name}">${layer_name}</div>
    <div class="layer_visibilility visible"></div>`
    new_layer.layer_list_row = layer_list_row;
    document.querySelector("#layer_panel_list").append(layer_list_row);

    // add listener to the layer element.
    layer_list_row.querySelector(".layer_element").addEventListener("click", () => {
      selectLayer(layer_name);
    });

    // add listner to the layer visibilility button.
    let layer_visibilility = layer_list_row.querySelector(".layer_visibilility");
    layer_visibilility.addEventListener("click", () => {
      if (layer_visibilility.classList.contains("visible")) {
        layer_visibilility.classList.replace("visible", "invisible");
        canvas_layer.classList.add("hidden");
      }
      else {
        layer_visibilility.classList.replace("invisible", "visible");
        canvas_layer.classList.remove("hidden");
      }
    });

    new_layer.designer.appendTo(canvas_layer);
    if (select) selectLayer(layer_name);
    module.layers.push(new_layer);
    return new_layer;
  };

  // selects the layer layer_name.
  const selectLayer = (layer_name) => {
    // deselect all other layers.
    document.querySelectorAll(".layer_element").forEach(element => {
      if (element.classList.contains("selected")) element.classList.remove("selected");
    });
    // select element and update variable.
    document.querySelector(`.layer_element[layer_name="${layer_name}"]`).classList.add("selected");
    module.selected_layer = {
      canvas_layer: document.querySelector(`.canvas_layer[layer_name="${layer_name}"]`),
      layer_list_row: document.querySelector(`.layer_list_row .layer_element[layer_name="${layer_name}"]`)
    };
  }

  return module;
}());