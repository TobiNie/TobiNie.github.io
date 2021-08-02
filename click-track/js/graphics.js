//helper, get first node
var firstDefaultNode = document.getElementById("defaultNode");


function draw(bar, pos){
	console.log("draw bar "+pos);
	var newSvg = null;
	var path = null;		//path for the main shape
	var firstBeat = null;	//path for shape of the first beat
	if (pos >= bars.length)
	{
	var background = document.querySelector(" .background");
	newSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let svgNS = newSvg.namespaceURI;
	newSvg.setAttribute('width',100);
	newSvg.setAttribute('height',100);
	newSvg.setAttribute('xmlns',"http://www.w3.org/2000/svg");
	newSvg.setAttribute('id',"barBox"+pos.toString());
	


	path = document.createElementNS(svgNS, 'use');
	path.setAttribute('class',"bars");
	path.setAttribute('id',"bar"+pos.toString());

	firstBeat = document.createElementNS(svgNS, 'use');
	firstBeat.setAttribute('class',"bars");
	firstBeat.setAttribute('id',"barFirst"+pos.toString());


	}
	else{
	newSvg = document.getElementById("barBox"+pos.toString());
	path = document.getElementById("bar"+pos.toString());

	firstBeat = document.getElementById("barFirst"+pos.toString());

	}

	if (bar.lower == 4){
		newSvg.setAttribute('viewBox',"0 0 75 100");
	}
	if (bar.lower == 8){
		newSvg.setAttribute('viewBox',"-37.5 0 150 100");
	}
	if (bar.lower == 16){
		newSvg.setAttribute('viewBox',"-62.5 0 200 100");
	}

	switch(bar.upper){
		case 1:
			path.setAttribute('href',"#one");
			firstBeat.setAttribute('href',"#oneFirst");
			break;
		case 2:
			path.setAttribute('href',"#two");
			firstBeat.setAttribute('href',"#twoFirst");
			break;
		case 3:
			path.setAttribute('href',"#three");
			firstBeat.setAttribute('href',"#threeFirst");
			break;
		case 4:
			path.setAttribute('href',"#four");
			firstBeat.setAttribute('href',"#fourFirst");
			break;
	}
	switch(bar.mode){
		case 1:
			path.setAttribute('fill-opacity', "1");
			firstBeat.setAttribute('fill-opacity', "0");
			break;
		case 2:
			path.setAttribute('fill-opacity', "0");
			firstBeat.setAttribute('fill-opacity', "1");
			break;
		case 3:
			path.setAttribute('fill-opacity', "0");
			firstBeat.setAttribute('fill-opacity', "0");
			break;
	}

	if (pos >= bars.length){
	newSvg.appendChild(path);
	newSvg.appendChild(firstBeat);
	background.insertBefore(newSvg, firstDefaultNode);
	}
		
}

function remove( pos){
	var svg = document.getElementById("barBox"+pos.toString());
	svg.parentNode.removeChild(svg);
}