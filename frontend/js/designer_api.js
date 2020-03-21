const designer_api = (function () {

  let module = {};

  module.layers = [];

  module.selected_layer = {canvas_layer: null, layer_list_row: null};

  module.createLayer = () => {
    let new_layer = {};
    // create the new canvase designer.
    new_layer.designer = new CanvasDesigner();
    new_layer.designer.widgetHtmlURL = '/widget.html';
    new_layer.designer.widgetJsURL = '/js/a.js';

    // add canvas designer to the page.
    let designer_layers = document.querySelector("#designer_layers")
    let canvas_layer = document.createElement("div");
    canvas_layer.classList.add("canvas_layer");
    canvas_layer.setAttribute("layer_name", `layer_${module.layers.length}`);
    new_layer.canvas_layer = canvas_layer;
    designer_layers.append(canvas_layer);

    // layer to the layer panel list.
    let layer_list_row = document.createElement("div");
    layer_list_row.classList.add("layer_list_row");
    layer_list_row.innerHTML = `
    <div class="layer_element" layer_name="layer_${module.layers.length}">layer_${module.layers.length}</div>
    <div class="layer_visibilility visible"></div>`
    new_layer.layer_list_row = layer_list_row;
    new_layer.layer_name = `layer_${module.layers.length}`;
    document.querySelector("#layer_panel_list").append(layer_list_row);
    
    // add listner to the layer element.
    let layer_element = layer_list_row.querySelector(".layer_element");
    layer_element.addEventListener("click", () => {
      if (layer_element.classList.contains("selected")) {
        layer_element.classList.remove("selected");
        module.selected_layer = null;
      }
      else {
        layer_element.classList.add("selected");
        module.selected_layer = {canvas_layer: canvas_layer, layer_list_row: layer_list_row};
        disableOthers()
      }
    });

    // add listner to the layer visibilility button.
    let layer_visibilility = layer_list_row.querySelector(".layer_visibilility");
    layer_visibilility.addEventListener("click", () => {
      if (layer_visibilility.classList.contains("visible")) {
        layer_visibilility.classList.replace("visible","invisible");
        canvas_layer.classList.add("hidden");
      }
      else {
        layer_visibilility.classList.replace("invisible","visible");
        canvas_layer.classList.remove("hidden");
      }
    });

    new_layer.designer.appendTo(canvas_layer);
    refreshLayerZ();
    module.layers.push(new_layer);
    return new_layer;
  };

  const refreshLayerZ = () => {
    module.layers.forEach((layer, i) => {
      layer.canvas_layer.children[0].style.zIndex = module.layers.length - i - 1;
    });
  };

  const disableOthers = () => {
    module.layers.forEach(layer => {
      if (layer.layer_list_row !== selected_layer.layer_list_row) {
        layer.canvas_layer.classList.add("noEvent");
        layer.canvas_layer.onkeydown = () => {};
      }
      else {
        layer.canvas_layer.classList.remove("noEvent");
        layer.canvas_layer.onkeydown = () => {};
      }
    })
  }

  return module;
}());