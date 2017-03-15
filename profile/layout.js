var svg;
var maxPoints = 30;
var Typed;

$(function(){

  Typed = $("#typed").typed({
      // strings: ["Typed.js is a <strong>jQuery</strong> plugin.", "It <em>types</em> out sentences.", "And then deletes them.", "Try it out!"],
      stringsElement: $('#typed-strings'),
      typeSpeed: 30,
      backDelay: 1200,
      loop: true,
      shuffle: true,
      contentType: 'html', // or text
      // defaults to false for infinite loop
      loopCount: false,
      preStringTyped: function(){/*addElement();*/},
  });

  $(".reset").click(function(){
      $("#typed").typed('reset');
  });

  $('.ribbon-stack img').click(function(ev){
    var className = ev.target.className;
    var el = $('.' + className);
    if (!el)
      return;
    var stack = el.parent().parent().parent();
    if (!el.parent().parent().hasClass('selected')){
      stack.children().removeClass('selected');
      el.parent().parent().addClass('selected');
      var rowId = stack.parent().parent()[0].id;
      $('#' + rowId + ' .ribbon-row-content').toggle('display');
    }
  });

  function shuffle(a) {
      var j, x, i;
      for (i = a.length; i; i--) {
          j = Math.floor(Math.random() * i);
          x = a[i - 1];
          a[i - 1] = a[j];
          a[j] = x;
      }
  }

  var randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  var randomColor = function () {
    var h = randomInt(0, 360);
    var s = randomInt(42, 98);
    var l = randomInt(38, 94);

    return "hsl(" + h + "," + s + "%," + l + "%)";
  };
  var running = false;

  function linkRecurse(el, opts){
      if (!opts){
        return;
      }
      running = true;
      shuffle(opts);
      var el2 = opts.pop();
      if (el2 == undefined){
          svg.addEventListener("mouseover", function(e) {
              if (running)
                  return;
              var el = e.target;
              if (el == svg || el.tagName == 'line') return;
              linkRecurse(el, circles.splice(1));
          });
          running = false;
          startMove(el);
          return;
      }
      animate.stop(el);
      animate.stop(el.line);
      animate.stop(el2);

      var cx = el.cx.baseVal.value, cy = el.cy.baseVal.value;
      var cx2 = el2.cx.baseVal.value, cy2 = el2.cy.baseVal.value;
      var d = Math.sqrt((cx - cx2) ** 2 + (cy - cy2) ** 2);
      var map = new Map();

      map.set("el", [el.line]);
      map.set('x1', [cx, cx]);
      map.set('y1', [cy, cy]);
      map.set("x2", [cx, cx2]);
      map.set("y2", [cy, cy2]);
      map.set("duration", d);
      map.set("easing", "easeOutSine");
      map.set('complete', function(){ linkRecurse(el2, opts); });
      animate(map);
      
      var map2 = new Map();
      map2.set("el", [el.line]);
      map2.set('x1', [cx, cx2]);
      map2.set('y1', [cy, cy2]);
      map2.set("duration", d);
      map2.set("easing", "easeOutSine");
      map2.set('delay', 600);
      map2.set("complete", function(){ startMove(el); });
      animate(map2);
      

  }

  function startMove(e, t, type){
      t = t || randomInt(10000, 25000);
      type = type || "linear"; 
      var cx = e.cx.baseVal.value, cy = e.cy.baseVal.value;
      var newX = randomInt(0, maxX-e.getAttribute('r')), newY = randomInt(0, maxY-e.getAttribute('r'));
      var map = new Map();
      map.set("el", [e]);
      map.set("cx", [cx, newX]);
      map.set("cy", [cy, newY]);
      map.set("duration", t);
      map.set("easing", type);
      map.set('complete', function() { startMove(e); })
      animate(map);
  }

  var svgNS = "http://www.w3.org/2000/svg";
  var create = function (el) {
    return document.createElementNS(svgNS, el);
  };

  var svg = $("svg")[0];
  var maxX = $('svg').width();
  var maxY = $('svg').height();
  var params = [];
  var circles = [];
  var lines = [];
  var i = maxPoints;
  while (i--) {
    var circle = create("circle");

    circle.setAttribute("fill", randomColor());
    circle.setAttribute("r", randomInt(10, 14));
    circle.setAttribute("cx", maxX/2);
    circle.setAttribute("cy", maxY/2);

    var line = create("line");
    circle.line = line;
    lines.push(line);
    svg.appendChild(line);

    circles.push(circle);
  }

  for (var i = 0; i < circles.length; i++){
      var a = circles[i];
      var e = -1;
      while (e < 0 || circles[e] == a){
          e = randomInt(0, circles.length-1);
      }
      var line = lines[i];
      line.setAttribute('style', 'stroke:rgba(148, 139, 76, .5); stroke-width:6px;');
      line.setAttribute('x1', parseFloat(a.getAttribute('cx')));
      line.setAttribute('y1', parseFloat(a.getAttribute('cy')));
      line.setAttribute('x2', parseFloat(circles[e].getAttribute('cx')));
      line.setAttribute('y2', parseFloat(circles[e].getAttribute('cy')));
      svg.appendChild(circles[i]);
  }

  for (var i = 0; i < maxPoints; i++){
      startMove(circles[i], 3000, 'easeOutSine');
  }

  svg.addEventListener("mouseover", function(e) {
      var el = e.target;
      if (el == svg || el.tagName == 'line') return;
      linkRecurse(el, circles.slice(1));
  });
    
});