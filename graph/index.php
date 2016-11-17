<!DOCTYPE>

<html>

  <head>
    <title>CytoGraph</title>

    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">

    <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" rel="stylesheet" type="text/css">
    <script src="http://code.jquery.com/jquery-2.0.3.min.js"></script>
    <!--script src="http://cytoscape.github.io/cytoscape.js/api/cytoscape.js-latest/cytoscape.min.js"></script-->
    <script src="cy-plugins/cytoscape.js"></script>

    <link rel="shortcut icon" href="favicon.ico">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <!--script src="cy-plugins/cytoscape-cxtmenu.js"></script-->
    <script src="cy-plugins/cytoscape-undo-redo.js"></script>
    <script src="cy-plugins/cytoscape-edgehandles.js"></script>
    <script src="cy-plugins/cytoscape-grid-guide.js"></script>
    <script src="cy-plugins/cytoscape-clipboard.js"></script>
    <!--link href="cy-plugins/cytoscape-context-menus.css" rel="stylesheet" type="text/css" />
    <script src="cy-plugins/cytoscape-context-menus.js"></script-->
    <script src="jscolor.min.js"></script>

    <script src="ace/ace.js" type="text/javascript" charset="utf-8"></script>
    <link href="style.css" rel="stylesheet" type="text/css">
    <script src="graphjs.js"></script>
    <script src="jquery.sidebar.min.js"></script>
    <script src="execute.js"></script>

    <script type="text/javascript">
	function loadData(type, data){
	  if(type == 'code'){
	    ace.edit("console-area").setValue(data);
	    if ($('#consoleBtn').hasClass('btn-active'))
	      $('#consoleBtn').click();
	  }else{
	    var me = JSON.parse(data.replace(/&quot;/g, '"'));
	    fromJSON(me);
	    cy.fit();
	  }
	}

	function submitted(method){
	  var type = document.getElementById('type-select').value;
	  var name = document.getElementById('select-input').value;
	  var text = '';
	  if (method == 'save'){
	    if (type == "graph"){
	      text = JSON.stringify(toJSON());
	    }else if (type == 'code'){
	      text = document.getElementById('modal-text').value;
	    }
	  }
	  if (method == 'load' && name == 'Custom'){
	    loadData(type, text);
	    return;
	  }
	  var ret = $.post('graphIO.php', {'Method': method, 'Name': name, 'Type': type, 'Text': text}, function(data, status) {
	    if (data.startsWith('ERROR')){
	      document.getElementById('modal-error').innerHTML = data;
	    } else if (data.startsWith('SUCCESS:')){
        document.getElementById('modal-error').innerHTML = data.substr(8);
      }else if (method == 'load'){
	      document.getElementById('modal-error').innerHTML = "";
	      loadData(type, data);
	    }else {
	      document.getElementById('modal-error').innerHTML = data;
	    }
	  });
	}

    </script>
  </head>

  <body>
    <!-- Modal -->
    <div id="myModal" class="modal fade" role="dialog">
      <div class="modal-dialog">

        <!-- Modal content-->
	      <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal">&times;</button>
            <h4 class="modal-title">Save or load your graphs and code objects to share them...</h4>
          </div>
          <div class="modal-body">
      	    <p>Type</p>
      	    <select name='Type' id='type-select' onchange="loadSamples();">
      	      <option value='graph'>Graph</option>
	      <option value='code'>Script</option>
            </select><br>
      	    <p>Name</p>
	    <div class='inp-select'>
	      <select id='sample-select' onchange="sampleGraphSelected(this);">
              </select>
              <input type='text' name='Text' id='select-input'/>
	    </div>
	    <p id='modal-error'></p><br>
	    <p>Text</p>
	    <textarea id='modal-text' type="text" name="Text" style="resize:none;"></textarea>
          </div>
          <div class="modal-footer">
            <input type='button' onclick='submitted("load"); $(".close").click();' name='load' id='load' class="btn btn-default" value='Load'/>
            <input type='button' onclick='submitted("save");' name='save' id='save' class="btn btn-default" value='Save'/>
            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <div class="script">
      <div class='script-row'>
        <button class="row-btn btn-left btn-active" id="consoleBtn" onclick="toggleConsole();">Console</button>
        <button id="graph-btn" onclick="cy.elements().unselect(); document.getElementById('modal-text').value=JSON.stringify(cy.json()); loadSamples();" data-toggle="modal" data-target="#myModal" class="row-btn dropdown"><i class="fa fa-save"></i>Database</button>
        <button class="row-btn btn-right" id="settings" onclick="toggleSettings();" title="Settings"><i class="fa fa-gear"></i>Tools</button-->
        <!--button class="row-btn btn-right" id="run" onclick="run();" title="Run...">Run</button-->
      </div><br>
      <div id='script-area'>
        <div id='console' class='script-row'>
          <div id='console-area'></div>
          <button class='run-button' onclick="execute();"><span class="fa fa-play"></span></button>
        </div>
        <script>
          var editor = ace.edit("console-area");
          editor.setTheme("ace/theme/monokai");
          editor.getSession().setMode("ace/javascript");
          editor.$blockScrolling = Infinity;
        </script>
      </div>
    </div>


    <input type="text" id="textInput" value=""/>
    <div id="cyto"></div>
    <div class="sidebar" name='sidemenu'>
       <ul class="menu">
          <li id='addNode' onclick="toolClick('addNode');"><i class="fa fa-plus-circle"></i></li>
          <li id='edge' onclick="toolClick('edge');"><i class="fa fa-mars"></i></li>
          <li id='erase' onclick="toolClick('erase');"><i class="fa fa-trash"></i></li>

          <li onclick="ur.undo();"><i class="fa fa-undo"></i></li>
          <li onclick="ur.redo();"><i class="fa fa-repeat"></i></li>
          <li id='settings-item' style="list-item">
            <div class="settings-box">
              <button id='node-color' onclick="toggleColor(this);" class="jscolor {valueElement:null,value:'aaaaaa',onFineChange:'nodeColorChange(this)'}">Node</button><br>
              <button id='edge-color' onclick="toggleColor(this);" class="jscolor {valueElement:null,value:'aaaaaa',onFineChange:'edgeColorChange(this)'}">Edge</button><br>
              <button id='shapeToggler' onclick='toggleScroll(this);'><i id='shapeView' class="fa fa-circle"></i></button><br>
              <button id='edgeToggler' onclick='toggleScroll(this);'><i id='edgeView' class="fa fa-long-arrow-right"></i></button><br>
            </div>
          </li>
        </ul>
        <div class="scrollmenu shape-scroll" id="shapes" style="display:none; cursor:default;">
          <i id="ellipse" class="fa fa-circle"></i>
          <i id="roundrectangle" class="fa fa-square"></i>
          <i id="triangle" class="fa fa-play fa-rotate-270"></i>
          <i id="rectangle" class="fa fa-stop"></i>
          <i id="star" class="fa fa-star"></i>
          <i id="diamond" class="fa fa-square fa-rotate-45"></i>
          <i id="vee" class="fa fa-chevron-down"></i>
        </div>
        <div class="scrollmenu edge-scroll" id="edges" style="display:none; cursor:default;">
          <i id="directed" class="fa fa-long-arrow-right"></i>
          <i id="bidirectional" class="fa fa-arrows-h"></i>
          <i id="undirected" class="fa fa-minus"></i>
        </div>

    </div>
    <div class="home">
      <a href="http://brettjsettle.site/graph/documentation" style="position: absolute; padding-left: 10px;">Documentation</a>
      <p>By <a href="../index.html">Brett Settle</a></p>
    </div>

    <div class='settings-menu' style="display: none; overflow-y: auto; padding-bottom:40px;">
      <a onclick="toggleSettings();" style="right: 0; position: fixed; margin: 5px; padding:5px; font-size: 1.5em;"><i class="fa fa-close"></i></a>
      <h3>Tools</h3>
      <div class="modules">
        <div id="snapToGrid" class="disabled">
            Grid Snap <b> Off </b>
        </div>
        <div id="nodeLabel" class="enabled">
            Node Label <b> On </b>
        </div>
        <div id="edgeWeight" class="enabled">
            Edge Weight <b> On </b>
        </div>
        <div id="size-slider">
          <p style="margin-bottom:-10px;">Node Size</p>
          <input type="range" class='nodeSize' oninput="fixAllNodes();" min=".2" max="3" value="1" step=".1"/>
        </div>
        <div id="size-slider">
          <p style="margin-bottom:-10px;">Label Size</p>
          <input type="range" class='labelSize' oninput="fixAllNodes();" min=".2" max="3" value="1" step=".1"/>
        </div>
        <div id='auto-fit' class='disabled'>
          Autosize Nodes <b> Off </b>
        </div>
        <div id='selection-type' class='disabled'>
          Additive Select <b> Off </b>
        </div>
      </div>
      <input type="button" class="complete-button" value="Complete" style="margin-bottom:.2em;"/>
      <input type="button" class='export-button' value="Export" style="margin-bottom:.2em;"/>
      <input type="button" class="fit graph" value="Fit View"  style="margin-bottom:.2em;" onclick="cy.fit();"/>
      <button id='background-color' onclick="toggleColor(this);" class="jscolor {valueElement:null,value:'ffffff',onFineChange:'coreColorChange(this)'}">Background Color</button>
      <p style="margin-bottom: 2px; padding-top:6px">Layout</p>
      <input type="button" id='grid' value='Grid' onclick="setLayout(this.id);"/>
      <input type="button" id='concentric' value='Concentric' onclick="setLayout(this.id);"/>
      <input type="button" id='circle' value='Circle' onclick="setLayout(this.id);"/>
      <input type="button" id='random' value='Random' onclick="setLayout(this.id);"/>
      <input type="button" id='breadthfirst' value='Breadthfirst' onclick="setLayout(this.id);"/>
      <input type="button" id='cose' value='Cose' onclick="setLayout(this.id);"/>
    </div>

    <div class="frame" name='frameWindow' style="display:none;"">
      <input type="button" value="Close" onclick="hideFrame();"/>
      <div class='frame-area' style="height:100%; width:100%">
      </div>
    </div>

  </body>
</html>
