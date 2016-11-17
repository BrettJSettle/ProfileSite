var ur = undefined;
var cy;

function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}

function G(name, name2){
  if (name == undefined){
    return cy.elements();
  }
  var a = cy.filter('node[name = "' + name + '"]');
  if (name2){
    return a.edgesWith(G(name2));
  }
  return a;
}
g = G;

function Gf(name){
  return cy.$(name);
}

function fromJSON(graph){
  cy.elements().remove();
  $('#cyto').css('background-color', graph['background-color']);
  cy.add(graph['nodes']);
  for (var i = 0; i < graph['nodes'].length; i++) {
    graph['edges'][i]['style']['source-arrow-color'] = graph['edges'][i]['line-color'];
    graph['edges'][i]['style']['target-arrow-color'] = graph['edges'][i]['line-color'];
  }
  cy.add(graph['edges']);
}

function makeUndoRedo(){
  var options = {
    isDebug: false, // Debug mode for console messages
    actions: {},// actions to be added
    undoableDrag: true, // Whether dragging nodes are undoable
  };

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
  return ur;
}

$(document).ready(function(){
  ur = makeUndoRedo();
  cy.on('select', function(ev){
    var el = ev.cyTarget;
    el.data('unselected-color', el.group() == 'nodes' ? el.css('background-color') : el.css('line-color'));
    el.css({'border-color': 'red', 'border-width': '3px', 'line-color': 'red', 'target-arrow-color': 'red', 'source-arrow-color': 'red'});
  });

  cy.on('unselect', function(ev){
    var el = ev.cyTarget;
    var color = el.data('unselected-color') || '';
    el.css({'border-width': 0, 'line-color': color, 'target-arrow-color': color, 'source-arrow-color': color});
  });
  
});

function log(data){
  $('.output-area').val($('.output-area').val() + data + '\n');
}

function step(els, i, last) {
  i = i || 0;
  if (i == els.length)
    return;
  if (els[i].isNode())
    els[i].flashClass('stepNode', 1500);
  else
    els[i].flashClass('stepEdge', 1500);
  setTimeout(function() { step(els, i+1); }, 1500);
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

function bfs(root, func, directed){
  return cy.elements().bfs({'root': root, 'func': func, 'directed': directed}).path;
}

breadthFirstSearch = BFS = bfs;

function dfs(root, func, directed){
  return cy.elements().dfs({'root': root}).path;
}
depthFirstSearch = DFS = dfs;
