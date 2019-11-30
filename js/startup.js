paper.install(window);
window.onload = function() {
	paper.setup('tannenbaum');
	h = paper.project.view.bounds.height;
	w = paper.project.view.bounds.width;
	compgroup = new Group();
	generateLandschaft();
	waldRoden();
	document.querySelector("button#reset").addEventListener("click", waldRoden)
	document.querySelector("button#add").addEventListener("click", pflanzeBaum)
} 
