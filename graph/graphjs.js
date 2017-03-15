var inp = undefined;
var mode = 'addNode';
var ur = undefined;
var colorVis = {'node-color': false, 'edge-color':false, 'core-color' : false};
var shapeT='ellipse', edgeT='directed';
var sampleGraphs = ['Custom', 'Konigsberg', 'K4', 'K5', 'K6', 'K7', 'K8', 'K3,3', 'Cube', 'Octahedron', 'Dodecahedron', 'Icosahedron', 'Petersens'];
var cy;
var sampleScripts = ['Select', 'bfs', 'dfs'];
var sizeMult = 1;

function showInputForElement(ele){
  if (ele == undefined)
    return;
  if (ace.edit('console-area').isFocused())
    return;
  var pos;
  if (ele.group() == 'nodes') {
    pos = ele.renderedPosition();
  } else if (ele.group() == 'edges') {
    pos = {'x': (ele.source().renderedPosition()['x'] + ele.target().renderedPosition()['x']) / 2, 'y': (ele.source().renderedPosition()['y'] + ele.target().renderedPosition()['y']) / 2};
  }
  var x = parseFloat(pos['y']) - parseFloat($('#textInput').css('font-size')) / 1.7;
  var y = parseFloat(pos['x']) - parseFloat($('#textInput').css('width'))/2;
  inp.style.top = x + 'px';
  inp.style.left = y + 'px';
  ele.lock();
  inp.style.visibility="visible";
  if (ele.group() == 'nodes'){
    inp.value=ele.data('name') || '';
    ele.data('name', '');
  }else if (ele.group() == 'edges'){
    inp.value=ele.style('label') || '';
    ele.style('label', '');
  }
  inp.ele = ele;
  inp.focus();
}

function toggleColor(ev){
  if (colorVis[ev.id]){
    ev.jscolor.hide();
    colorVis[ev.id] = false;
  }
  else {
    ev.jscolor.show();
    colorVis[ev.id] = true;
  }
}

function nodeColorChange(color){
  var els = cy.$(':selected');
  if (els.length > 0){
    els.nodes().style('background-color', '#' + color);
  }else{
    cy.nodes().style('background-color', '');
    cy.style()
    .selector('node')
      .style({'background-color' : '#' + color})
    .update();
  }
}

function edgeColorChange(color){
  var els = cy.$(':selected');
  if (els.length > 0){
    els.edges().style({'line-color': '#' + color, 'text-outline-color': '#' + color, 'source-arrow-color': '#' + color, 'target-arrow-color': '#' + color});
  }else{
    cy.edges().style({'line-color': '', 'text-outline-color': '', 'target-arrow-color': '', 'source-arrow-color': ''});
    cy.style()
    .selector('edge')
      .style({'line-color' : '#' + color, 'target-arrow-color': '#' + color, 'source-arrow-color': '#' + color, 'text-outline-color': '#' + color})
    .update();
  }
}

function coreColorChange(color){
  $('#cyto').css('background-color', '#' + color);
}

function hideInput(){
  var menu = $('.shape-scroll');
  if (menu.css('width') > 0)
    menu.animate({'width': 'toggle'}, 500);
  menu = $('.edge-scroll');
  if (menu.css('width') > 0)
    menu.animate({'width': 'toggle'}, 500);
  
  if (inp.ele != undefined){
    inp.style.visibility="hidden";
    var n = inp.ele;
    n.unlock();
    if (n.group() == 'nodes'){
      n.data({'name': inp.value, 'id': inp.value});
      fixNode(n);
    } else if (n.group() == 'edges'){
      var opts = {'label': inp.value, 'text-outline-color': 'gray', 'text-outline-width': '2px', 'text-outline-opacity': '1'};
      if ($('#auto-fit').hasClass('enabled')){
        opts['width'] = 'label';
        opts['height'] = label;
      }
      n.style(opts);
    }
  }
  inp.ele = undefined;
}

function getAlpha(num){
  result = "";
  while (num > 0){
    num -= 1;
    remainder = num % 26;
    digit = String.fromCharCode(remainder + 65);
    result = digit + result;
    num = (num - remainder) / 26;
  }
  return result;
}

function getNewNodeData(){
  var i = 1;
  var a = getAlpha(i);
  while (cy.hasElementWithId(a)){
    i += 1;
    a = getAlpha(i);
  }
  return {'id': a, 'name': a};
}

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

$(document).delegate('#console-area', 'keydown', function(e) {
  var keyCode = e.keyCode || e.which;
  if (e.shiftKey && e.key == 'Enter'){
    execute();
    e.stopPropagation();
    e.preventDefault();
    return;
  }
  if (keyCode == 9) {
    e.preventDefault();
    var start = $(this).get(0).selectionStart;
    var end = $(this).get(0).selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    $(this).val($(this).val().substring(0, start)
                + "\t"
                + $(this).val().substring(end));

    // put caret at right position again
    $(this).get(0).selectionStart =
    $(this).get(0).selectionEnd = start + 1;
  }
});

$('#output-area').resize(function() { $('#console-area').resize(); });

function keyDown(a){
  if (ace.edit("console-area").isFocused())
    return;
  else if (a.keyCode == 13){
    hideInput();
    return;
  }
  else if (a.keyCode == 46){
    ur.do("deleteEles", cy.$(':selected'));
    inp.ele == undefined;
  }
  else if (a.ctrlKey && $('.modal').css('display') == 'none'){
    if (a.which == 67) {// CTRL + C
        cy.clipboard().copy(cy.$(":selected"));
    } else if (a.which == 86) { // CTRL + V
          ur.do("paste");
    } else if (a.which == 65) {
        cy.elements().select();
        a.preventDefault();
    } else if (a.key == 'z'){
      ur.undo();
    } else if (a.key == 'y'){
      ur.redo();
    }
  }
  else if (inp.ele == undefined && (a.key == 'Backspace' || a.key.length == 1) && mode != 'settings'){
    var selected = cy.$(':selected');
    if (selected.length == 1)
      showInputForElement(selected[0]);
  }
}

function modeChanged(){
  cy.edgehandles(mode == 'edge' ? 'enable' : 'disable');
  cy.edgehandles(mode == 'edge' ? 'drawon' : 'drawoff');
  if (mode == 'erase' || mode == 'edge'){
    cy.nodes().lock();
  }
  else{
    cy.nodes().unlock();
  }
}

function toggleScroll(v){
  var menu = v.id == 'shapeToggler' ? $('.shape-scroll') : $('.edge-scroll'), top = v.offsetTop, left = v.clientWidth;
  var othermenu = v.id != 'shapeToggler' ? $('.shape-scroll') : $('.edge-scroll');
  menu.css('top', top);
  menu.css('left', left);

  if (othermenu.css('display') != 'none'){
    othermenu.toggle()
  }
  menu.toggle()
}

function renameNode(node, v){
  node.data('name', v);
  node.data('id', v);
}

function hideFrame(){
  var frame = $('.frame'), frameArea = $('.frame-area');
  if (frameArea.children().length > 0)
    frameArea[0].removeChild($('.frame-area iframe')[0]);
  frame[0].style['display'] = 'none';
  
}

function g(name, name2){
  var a = cy.filter('node[name = "' + name + '"]');
  if (a === 'undefined')
    a = cy.$(name);
  if (name2){
    return a.edgesWith(g(name2));
  }
  return a;
}

function setLayout(layout){
  cy.elements().unselect();
  cy.elements().unlock();
  if (!cy.nodes())
    return;
  cy.layout().stop();
  if (layout == 'null' || layout == 'cose'){
    cy.layout({'name': layout});
    return;
  }
  var s = cy.nodes().length * cy.nodes().width();
  boundingBox = {'x1': 0, 'y1': 0, 'w':s, 'h':s};
  options = { 'name': layout , 'padding': '50px', 'animate':true, 'boundingBox': boundingBox};
  if (layout == 'circle'){
    options['radius'] = 2 * cy.nodes().width() * cy.nodes().length / 3.1415926535;
  }
  var layout = cy.elements().makeLayout(options);
  layout.run();
}

function toggleConsole(a){
  var el = document.getElementById('script-area');
  el.style.display = $('#consoleBtn').hasClass('btn-active') ? 'inline-block' : 'none';
  $('#consoleBtn').toggleClass("btn-active");
}


function toolClick(a){
  var m = document.getElementById(a);
  if (mode != undefined)
    document.getElementById(mode).style.background = 'rgb(255, 255, 255)';
  
  if (mode == a){
    mode = undefined;
    modeChanged();
    return;
  }
  m.style.background = 'rgb(200, 200, 200)';
  mode = a;
  modeChanged();
}

function loadGraph(){
  ur.clear();
  var a = document.getElementById('graph-text').value;
  var json = JSON.parse(a);
  cy.json(json);
  cy.nodes().unlock();
  $('.modal').modal('hide');
}

function sampleGraphSelected(v){
  document.getElementById('select-input').value = v.value;
  //$('.modal').modal('show');
}

function loadSamples(){
  //$('.modal').modal('show');
  document.getElementById('modal-text').value = document.getElementById('type-select').value == 'graph' ? JSON.stringify(cy.json()) : ace.edit('console-area').getValue();
  var val = document.getElementById('type-select').value;
  var select = document.getElementById('sample-select');
  var i;
  for(i = select.options.length - 1 ; i >= 0 ; i--)
  {
      select.remove(i);
  }
  
  (val == 'graph' ? sampleGraphs : sampleScripts).forEach(function(k){
    var opt = document.createElement('option');
    opt.value = k;
    opt.innerHTML = k;
    select.appendChild(opt);
  });
}

$(document).ready(function(){

  document.getElementById('addNode').style.background = 'rgb(200, 200, 200)';
  $('#script-area').mousemove(function(ev){
    if (ev.buttons == 1){
      ace.edit('console-area').resize();
    }
  });

  document.onclick = function(a){
    if (a.srcElement){
      if (a.srcElement.id != 'edgeView'  && $('.edge-scroll').css('display') == 'block'){
        toggleScroll($('#edgeToggler')[0]);
      }else if (a.srcElement.id != 'shapeView'  && $('.shape-scroll').css('display') == 'block'){
        toggleScroll($('#shapeToggler')[0]);
      }
    }
  }

  document.getElementById('shapes').onclick = function(ev){
    var s = ev.target.id;
    if (s == 'shapes' || s == 'undefined')
      return;
    var els = cy.$(':selected');
    if (els.length > 0){
      els.style('shape', s);
    }else{
      cy.nodes().style('shape', '');
      cy.style()
      .selector('node')
        .style({'shape': s})
      .update();
    }
    $('#shapeView')[0].className = ev.target.className;
    shapeT = ev.target.id;
    toggleScroll($('#shapeToggler')[0]);
  }

  document.getElementById('edges').onclick = function(ev){
    var v = ev.target.id;
    if (v == 'edges')
      return;
    var s = v =='bidirectional' ? 'triangle' : 'none', t = v=='undirected' ? 'none' : 'triangle';
    var els = cy.$(':selected');
    if (els.length > 0){
      els.style({'source-arrow-shape': s, 'target-arrow-shape': t});
    }else{
      cy.edges().style({'source-arrow-shape': '', 'target-arrow-shape': ''});
      cy.style()
      .selector('edge')
        .style({'source-arrow-shape': s, 'target-arrow-shape': t})
      .update();
    }
    $('#edgeView')[0].className = ev.target.className;
    edgeT = ev.target.id;
    toggleScroll($('#edgeToggler')[0]);
    ev.stopPropagation();
  }

});

function toJSON(){
  cy.elements().unselect();
  var els = cy.elements().toArray();
  var data = {'background-color': $('#cyto').css('background-color'), 'edges': [], 'nodes': []};
  for (var i = 0; i < els.length; i++) {
    if (els[i].group() == 'nodes'){
      data['nodes'].push({'group': 'nodes', 'data': {'id': els[i].id(), 'name': els[i].data('name')}, 
	'position': els[i].position(), 'style': {'shape': els[i].style('shape'), 
	'background-color': els[i].style('background-color')}});
    } else if (els[i].group() == 'edges') {
      data['edges'].push({'group': 'edges', 'data': {'source': els[i].source().id(), 
	'target': els[i].target().id(), 'label': els[i].style('label')}, 'style': {'line-color': 
	els[i].style('line-color'), 'source-arrow-shape': els[i].style('source-arrow-shape'), 
	'target-arrow-shape': els[i].style('target-arrow-shape')}});
    }
  }
  return data;
}

function fromJSON(graph){
  cy.elements().remove();
  $('#cyto').css('background-color', graph['background-color']);
  cy.add(graph['nodes']);
  for (var i = 0; i < graph['edges'].length; i++) {
    graph['edges'][i]['style']['source-arrow-color'] = graph['edges'][i]['style']['line-color'];
    graph['edges'][i]['style']['target-arrow-color'] = graph['edges'][i]['style']['line-color'];
  }
  cy.add(graph['edges']);
}

function hideModal(){
  $('.modal').hide();
}

function showModal(){
  $('.modal').show();
}

$(function(){
  var is = $('ul i');
  for (var i = 0; i < is.length; i++)
    is[i].ontouchend = function(ev){
      $(ev.srcElement).toggleClass('hovered');
    }

  document.getElementById('erase').ondblclick=function(){
    if (confirm('Are you sure you want to clear the whole graph?')) {
        ur.do("deleteEles", cy.elements());
      }
  }

  inp = $('#textInput')[0];
  inp.addEventListener("focusout", hideInput());

  cy = window.cyto = cytoscape({
    container: document.getElementById('cyto'),

    layout: {
      'name': 'grid',
      'condense': true,
      'avoidOverlapPadding': 200,
    },

    zoom: 2,
    pan: { x: 0, y: 0 },

    style: [
      {
        selector: 'node',
        css: {
          'content': 'data(name)',
          'text-wrap': 'wrap',
          'text-valign': 'center',
        }
      },
      {
        selector: 'edge',
        css: {
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'width': 3,
          'color':'white',
        }
      },
    ],
  });

  $('#console').focusin(function(a){
    cy.elements().unselect();
  });
  var cb = cy.clipboard();
  cy.edgehandles({
      toggleOffOnLeave:true,
      cxt:false,
      hoverDelay: 0,
      handleSize:40,
      enabled:false,
      handleNodes: function(){ return mode == 'edge';},
      handleColor: 'rgba(255, 0, 0, .2)',
      nodeLookOffset: 0,
      loopAllowed: function(n){
        return true;
      },
      complete: function(a, b, e){
        cy.elements().unselect();
        e.select();
        var s = edgeT =='bidirectional' ? 'triangle' : 'none', t = edgeT=='undirected' ? 'none' : 'triangle';
        fixEdge(e);
        ur.do('restoreEles', e);
      }
  });
  
  var options = {
        isDebug: false, // Debug mode for console messages
        actions: {},// actions to be added
        undoableDrag: true, // Whether dragging nodes are undoable
    }

  ur = cy.undoRedo(options); // Can also be set whenever wanted.

  //UR Functions
  function deleteEles(eles){
    return eles.remove();
  }
  function restoreEles(eles){
      return eles.restore();
  }

  ur.action("deleteEles", deleteEles, restoreEles);
  ur.action("restoreEles", restoreEles, deleteEles);

  cy.on('cxttap', function(event){
    //console.log(event);
  });

  var tappedBefore;
  var tappedTimeout;
  cy.on('tap', function(event) {
    colorVis['node-color'] = false;
    colorVis['edge-color'] = false;
    colorVis['core-color'] = false;
    var tappedNow = event.cyTarget;
    if (tappedTimeout && tappedBefore) {
      clearTimeout(tappedTimeout);
    }
    if(tappedBefore === tappedNow) {
      tappedNow.trigger('doubleTap');
      tappedBefore = null;
    } else {
      tappedTimeout = setTimeout(function(){ tappedBefore = null; }, 300);
      tappedBefore = tappedNow;
    }
  });

  cy.on('doubleTap', 'node', function(event) {showInputForElement(event.cyTarget);});
  cy.on('doubleTap', 'edge', function(event) {showInputForElement(event.cyTarget);});

  cy.on('unselect', 'node', function(ele){
    hideInput();
  });

  cy.on("grab pan", function(ele){
    hideInput();
  });


  document.addEventListener("keydown", keyDown, false);
  
  cy.on('select', function(ev){
    var el = ev.cyTarget;
    if(el.group() == 'nodes')
      el.css({'border-color': 'red', 'border-width': '3px'});
    else{
      el.css({'overlay-color': 'red', 'overlay-padding': '2px', 'overlay-opacity': '.8'});
    }
  });

  cy.on('unselect', function(ev){
    var el = ev.cyTarget;
    el.css({'border-width': '0px', 'overlay-color': '', 'overlay-opacity': '', 'overlay-padding': ''});
  });
  
  cy.on('tap', function(ev){
    var evtTarget = ev.cyTarget;
    if( evtTarget === cy ){
      hideInput();
      cy.elements().unselect();
      if (mode == 'addNode'){
        var data = getNewNodeData();
        ur.do('add', {
            group: "nodes",
            data: data,
            position: ev.cyPosition,
        });
        var newNode = cy.getElementById(data['id']);
        newNode.style({'background-color': $('#node-color').css('background-color'), 'shape': shapeT});
        
        if ($('.edge-scroll').css('display') == 'block'){
          toggleScroll($('#edgeToggler')[0]);
        }
        if ($('.shape-scroll').css('display') == 'block'){
          toggleScroll($('#shapeToggler')[0]);
        }


        fixNode(newNode);
	      if (this.data)
          newNode._private.__proto__.toString = function(){
            return this.data('name');
          };
        newNode.select();
      }
    } else {
      if (mode == 'erase'){
        ur.do("deleteEles", ev.cyTarget);
      }
    }
  });

  cy.on('boxselect', function(ev){
    if (mode == 'erase'){
      ur.do("deleteEles", ev.cyTarget);
    }
  });

  cy.gridGuide({
    'drawGrid': false,
    'snapToGrid': false,
    'discreteDrag': false,
    'strokeStyle': '#999999',
    'guidelines': false
  });

  $(".modules div").click(function () {
    var el = $(this);
    var opt = {};
    if (el.hasClass("enabled")) {
        el.children("b").text(" Off");
        el.removeClass("enabled");
        el.addClass("disabled");
    } else {
        el.children("b").text(" On");
        el.addClass("enabled");
        el.removeClass("disabled");
    }

    if (el.attr("id") == 'snapToGrid'){
      var locked = false;
      if (cy.elements().locked()){
        locked = true;
        cy.elements().unlock();
      }
      cy.gridGuide({"drawGrid": el.hasClass("enabled"), "snapToGrid": el.hasClass("enabled"), 'discreteDrag': el.hasClass("enabled")});
      if (locked)
        cy.elements().lock();
    }else if (el.attr("id") == "nodeLabel"){
      var val = el.hasClass("enabled") ? 1 : 0;
      var opts = {'text-opacity': val};
      cy.nodes().style(opts);
    }else if (el.attr("id") == "edgeWeight"){
      cy.edges().style('text-opacity', el.hasClass("enabled") ? 1 : 0);
    }else if (el.attr("id") == "auto-fit"){
      fixAllNodes();
    }else if (el.attr('id') == 'selection-type'){
      cy._private.selectionType = el.hasClass('enabled') ? 'additive' : 'single';
    }
  });

  $('.export-button').click(function(){
    var a = document.createElement("a");
    a.download = "graph.jpg";
    cy.elements().unselect();
    a.href = cy.png({'bg': $('#cyto').css('background-color')});
    console.log(a.href);
    a.click();
  });

  $('.complete-button').click(function(){
    var toAdd = []
    for(var i = 0; i < cy.nodes().length; i++){
      var el = cy.nodes()[i];
      for (var j = i + 1; j < cy.nodes().length; j++){
        var el2 = cy.nodes()[j];
        if (el.edgesWith(el2).length == 0){
          toAdd.push({'group': 'edges', 'data': {'source': el.id(), 'target': el2.id()}});
        }
      }
    }
    var a = ur.do('add', toAdd);
    cy.$(a).style({'target-arrow-shape': 'none', 'source-arrow-shape': 'none'});
  });

});

function fixNode(el){
  var opts = {'height': '30px', 'width': '30px', 'text-opacity': 1, 'padding-right': 0, 'padding-left': 0, 'padding-top': 0, 'padding-bottom': 0};
  if ($("#auto-fit").hasClass('enabled')){
    if ($.isNumeric(el.id)){
      var range = [0, 0];
      for (var i = 0; i < cy.nodes().length; i++){
        var v = weight(cy.nodes()[i]);
        range[0] = Math.min(range[0], v);
        range[1] = Math.max(range[1], v);
      }
      opts['width'] = Math.max(10, 10 + Math.min(200, weight(el)));
      opts['height'] = opts['width'];
    }else {
      opts['height'] = 'label';
      opts['width'] = 'label';
      opts['padding-left'] = '5px';
      opts['padding-right'] = '5px';
      opts['padding-top'] = '2px';
      opts['padding-bottom'] = '2px';
    }
  }

  if ($("#nodeLabel").hasClass("disabled")){
    opts['text-opacity'] = 0;
  }
  el.style(opts);

  var mult = parseFloat($('.nodeSize').val());
  el.style({'width': el.width() * mult, 'height': el.height() * mult});
  var mult = parseFloat($('.labelSize').val());
  el.style({'font-size': 16 * mult + 'px'});
  cy.edges().style({'font-size': 16 * mult + 'px'})

}

function fixEdge(el){

  opts = {'target-arrow-shape': 'none', 'source-arrow-shape': 'none', 'text-opacity': 1};
  var s = edgeT=='bidirectional' ? 'triangle' : 'none', t = edgeT=='undirected' ? 'none' : 'triangle';
  opts['source-arrow-shape'] = s;
  opts['target-arrow-shape'] = t;
  if ($("#edgeWeight").hasClass("disabled")){
    opts['text-opacity'] = 0;
  }
  var color = $('#edge-color').css('background-color');
  el.style(opts);
}

function fixAllNodes(){
  cy.nodes().toArray().forEach(function (el){
    fixNode(el);
  });
}

function toggleSettings(){
  $('.settings-menu').toggle('display');
}

/* Rewrite existing cytoscape algorithms */
function weight(el){
  var a = el.style('label');
  if ($.isNumeric(a)){
    return parseFloat(a);
  }
  return 0;
}
getWeight = weight;
