paper.install(window);
window.onload = function() {
	paper.setup('tannenbaum');
	h = paper.project.view.bounds.height;
	w = paper.project.view.bounds.width;
	compgroup = new Group();
	generateLandschaft();
	generateBaum();
	document.querySelector("button#generate").addEventListener("click", generateBaum)
} 
