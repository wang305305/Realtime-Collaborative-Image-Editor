const designer_api = (function () {

  let module = {};

  let layers = [];

  let selected_layer = {canvas_layer: null, layer_list_row: null};

  module.createLayer = () => {
    // create the new canvase designer.
    const designer = new CanvasDesigner();
    designer.widgetHtmlURL = '/widget.html';
    designer.widgetJsURL = '/js/a.js';

    // add canvas designer to the page.
    let designer_layers = document.querySelector("#designer_layers")
    let canvas_layer = document.createElement("div");
    canvas_layer.classList.add("canvas_layer");
    canvas_layer.setAttribute("layer_name", `layer_${layers.length}`);
    designer_layers.append(canvas_layer);

    // layer to the layer panel list.
    let layer_list_row = document.createElement("div");
    layer_list_row.classList.add("layer_list_row");
    layer_list_row.innerHTML = `
    <div class="layer_element" layer_name="layer_${layers.length}">layer_${layers.length}</div>
    <div class="layer_visibilility visible"></div>`
    layers.push({canvas_layer: canvas_layer, layer_list_row: layer_list_row});
    document.querySelector("#layer_panel_list").append(layer_list_row);
    
    // add listner to the layer element.
    let layer_element = layer_list_row.querySelector(".layer_element");
    layer_element.addEventListener("click", () => {
      if (layer_element.classList.contains("selected")) {
        layer_element.classList.remove("selected");
        selected_layer = null;
      }
      else {
        layer_element.classList.add("selected");
        selected_layer = {canvas_layer: canvas_layer, layer_list_row: layer_list_row};
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

    designer.appendTo(canvas_layer);
    refreshLayerZ();
    return designer;
  };

  const refreshLayerZ = () => {
    layers.forEach((layer, i) => {
      layer.canvas_layer.children[0].style.zIndex = layers.length - i - 1;
    });
  };

  const disableOthers = () => {
    layers.forEach(layer => {
      console.log(layer.layer_list_row, selected_layer.layer_list_row);
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