paper.install(window);
window.onload = function() {
	paper.setup('tannenbaum');
	generateLandschaft();
	waldRoden();
	document.querySelector("button#reset").addEventListener("click", waldRoden)
	document.querySelector("button#add").addEventListener("click", pflanzeBaum)
	if (paper.project.view.bounds.width < 700) {
		document.querySelector("button#reset").innerHTML = "Generate!"
	}
} 
