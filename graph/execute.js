
function execute(){
  hideFrame();
  var iframe = document.createElement('iframe');
  iframe.setAttribute('height', '100%');
  iframe.setAttribute('width', '100%');
  iframe.setAttribute('sandbox', 'allow-scripts');
  var buildGraph = 'fromJSON(' + JSON.stringify(toJSON()) + ')';
  var html = `
<html>

  <head>
    <script src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
    <script src="http://cytoscape.github.io/cytoscape.js/api/cytoscape.js-latest/cytoscape.min.js"></script>

    <script src="cy-plugins/cytoscape-undo-redo.js"></script>
    
    <script src="http://brettjsettle.site/graph/graphFunctions.js"></script>
    <script src="http://brettjsettle.site/graph/cy-plugins/cytoscape-undo-redo.js"></script>
  </head>
  <body style="padding:0px; margin:0px;">
    <div id="cyto" style="width:100%; height: 90%;"></div>
    <div style="width:100%; height:10%;">
      <textarea class="output-area" disabled style="height:100%; width:100%; resize:none; background-color:#444; color:white;"></textarea>
    </div>
  </body>
  <script>
    cy = window.cyto = cytoscape({
      container: document.getElementById('cyto'),
      
      layout: {
        'name': 'grid',
        'condense': true,
        'avoidOverlapPadding': 200,
      },

      zoom: 1,
      pan: { x: 0, y: 0 },

      style: [
        {
          selector: 'node',
          css: {
            'content': 'data(name)',
            //'font-weight': 15,
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
        {
          selector: '.stepEdge',
          css: {
              'overlay-color': 'red',
              'overlay-padding': '2px',
              'overlay-opacity': '.8',
          }
        },
        {
          selector: '.stepNode',
          css: {
              'border-color': 'red',
              'border-width': '3px',
              'border-opacity': 1,
          }
        }
      ],
    });
    ` + buildGraph + `
    cy.fit();
    $(function(){
      userFunc();
    });

    window.onerror = function(msg, url, line, col, error) {
      console.log(url, line, col, error);
      log("ERROR: " + msg);
    };
    
    function fromJSON(graph){
      cy.elements().remove();
      $('#cyto').css('background-color', graph['background-color']);
      cy.add(graph['nodes']);
      for (var i = 0; i < graph['edges'].length; i++) {
        graph['edges'][i]['style']['source-arrow-color'] = graph['edges'][i]['line-color'];
        graph['edges'][i]['style']['target-arrow-color'] = graph['edges'][i]['line-color'];
      }
      cy.add(graph['edges']);
    }
    
    function userFunc(){
      ` + ace.edit("console-area").getValue() + `
    }
  </script>
</html>`;
  iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
  $('.frame-area')[0].appendChild(iframe);
  $('.frame')[0].style['display'] = '';
}
