
window.addEventListener("load", function() {
	window.onerror = function(e) {
		log(e.stack);
	}
});

function log(message) {
	var output = document.getElementById('output')
	if (output){
		output.value += '\n' + message;
	}
}
//console.log = window.log
function clearLog(){
	var output = document.getElementById('output')
	if (output){
		output.value = '';
	}
}
function G(name, name2){
	if (name == undefined){
		return cy.elements();
	}
	var a = cy.filter('node[label="' + name + '"]');
	if (name2){
		return a.edgesWith(G(name2));
	}
	return a;
}
g = G;

function Gf(name){
	return cy.$(name);
}

