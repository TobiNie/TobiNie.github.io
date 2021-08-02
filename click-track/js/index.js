var audioContext = null;
var node = null;

var barsString = "";
var bars = [];
var isPlaying = false;
var tempo = 120.0;
var noteLength = 0.05;      // length of "beep" (in seconds)
var timerWorker = null; 	//timer worker, timerOneshot sets timer with given interval
var currentBar = 0;
var nextBeatTime = 0;
var lookahead = 25.0;       // How frequently to call scheduling function 
                            //(in milliseconds)
							
var loop = true;			// loop around

//touch
var initialTouchPos = null;
var lastTouchPos = null;
var posTouchBar = null;
var rafPending = false;
var previousDifferenceInY = 0;
var previousDifferenceInX = 0;

function Bar(text){
	console.log("new bar");
    this.upper = parseInt(text[0])*10 + parseInt(text[1]);
    this.lower = parseInt(text[2])*10 + parseInt(text[3]);
	this.mode  = 1;

    this.tempo = parseInt(document.querySelector("#tempo").value);
	if (tempo == null || tempo == 0){
		this.tempo = 120;
		//todo throw error;
	}  
    barsString = barsString + text + "/";
  }
  
 function toggle(bar){
	 bar.mode++;
	 if (bar.mode == 2 && bar.upper == 1) bar.mode = 3;
	 if (bar.mode > 3) bar.mode = 1;
 }
  
function createBeats(){
	if(loop && currentBar == bars.length){
		//loop around from beginnning
		currentBar = 0;
	}	
	

	//for (bar of bars){
	var bar = bars[currentBar];
	if (bar != null){
		for (let i = 0; i < bar.upper; i++){
			    var osc = audioContext.createOscillator();
				osc.connect( audioContext.destination );
				time = nextBeatTime;
				secondsPerBeat = (60.0*60.0*2) /(parseInt(document.querySelector("#speed").value) * bar.tempo);
				nextBeatTime = (secondsPerBeat * (4 / bar.lower) ) + time;

				
				if (i == 0){    // beat 0 == high pitch
					osc.frequency.value = 880.0;
				}
				else {   // quarter notes = medium pitch
					osc.frequency.value = 440.0;

				}
				if ( (bar.mode == 1) || 
					 (bar.mode == 2 && i == 0) )
					 {
						osc.start( time );
						osc.stop( time + noteLength );	
						//osc.noteOn( time );
						//osc.noteOff( time + noteLength );	
					 }	
			
		}
	}
	else{

		
		//no bar left, stop
		play();
		
	}
	if(isPlaying){
	currentBar++;
	timerWorker.postMessage({"timerOneshot":( (nextBeatTime-audioContext.currentTime)*1000-lookahead) });
	}
	
}
  
function play() {
	console.log("play!");

	
	if (audioContext == null)
	{
		var AudioContext = window.AudioContext // Default
			|| window.webkitAudioContext // Safari and old versions of Chrome
    		|| false; 
		if (AudioContext) {	audioContext = new AudioContext; }
		var buffer = audioContext.createBuffer(1, 48000, 48000);
		node = audioContext.createBufferSource();
		node.buffer = buffer;
		node.connect(audioContext.destination);		
		node.start(0);
		//node.noteOn(0);

	}
	if (audioContext && (bars.length != 0))
	{
		//set now we are playing
		isPlaying = !isPlaying;
		if (isPlaying) { 
			currentBar = 0;
			nextBeatTime = audioContext.currentTime;
			createBeats();
			document.getElementById("playPath").setAttribute('fill',"#D03030");
			document.getElementById("playPath").setAttribute('d',"m35,18.75l30,0l0,30l-30,0z");

			//playBtn.innerText = "stop";
		} else {
			audioContext.close();
			delete audioContext;
			audioContext = null;
			timerWorker.postMessage("stop");			
			document.getElementById("playPath").setAttribute('fill',"#619E73");
			document.getElementById("playPath").setAttribute('d',"m41.3,48l0,-30l25.9,15z");

		}
	}

}
/*
function clickOnBackground() {
	console.log("clickonBackgrouond!");
	if (bars.length == 0){
		let newBar = new Bar("44");
		bars.push(newBar);
		draw(newBar,0);
	}
	else{
		var num = bars[bars.length-1].upper*10+bars[bars.length-1].lower;
		console.log(num.toString());
		let newBar = new Bar(num.toString());
		bars.push(newBar);
		draw(newBar,0);
	}


}
*/


function init(){

	console.log("init!");

    timerWorker = new Worker("js/timerworker.js");
    timerWorker.onmessage = function(e) {
        if (e.data == "tick") {
            console.log("tick!");
            createBeats();
        }
	}
   
    //const addBars = document.querySelectorAll(".nav button");

	
	document.addEventListener('keydown', function(event) {
    if(event.keyCode == 32) {
        play();
    }
	if(event.keyCode == 82) {
		loop = !loop;
		if (loop)loopBtn.style.opacity="1";
		else loopBtn.style.opacity="0.5";
	}
	
	});
   
};

//----------MAIN-----------
  
window.addEventListener("load", init );
  

//PLAY BUTTON
const playBtn = document.querySelector(".play");
playBtn.addEventListener("click", play);


//LOOP BUTTON
const loopBtn = document.querySelector("#loop");
loopBtn.addEventListener("click", function(){
	loop = !loop;
	if (loop)loopBtn.style.opacity="1";
	else loopBtn.style.opacity="0.5";
});

const deleteBtn = document.querySelector("#delete");
deleteBtn.addEventListener("click", function(){
	if (bars.length>0)
	{
		remove(bars.length-1);
		bars.pop();
	}

	
})

const addBars = document.querySelectorAll(" .nav svg");
addBars.forEach((addBar)  => {
	addBar.addEventListener("click", function() {
	var newBar = new Bar(addBar.id);
	draw(newBar,bars.length);

	bars.push(newBar);
	})
});


//toggle all beats, first beat, or silent
document.addEventListener('click',function(e){
    if( isBar(e) ){

		let pos = getPosfromEvent(e);

		let myBar = bars[pos];
		console.log(e.target.id);

		toggle(myBar);
		draw(myBar, pos);
    }
});

 




//TOUCH https://developers.google.com/web/fundamentals/design-and-ux/input/touch
// Check if pointer events are supported.
if (window.PointerEvent) {
	// Add Pointer Event Listener
	document.addEventListener('pointerdown', barTouchStart, true);
	document.addEventListener('pointermove', barTouchMove, true);
	document.addEventListener('pointerup', barTouchEnd, true);
	document.addEventListener('pointercancel', barTouchEnd, true);
  } else {
	// Add Touch Listener
	document.addEventListener('touchstart', barTouchStart, true);
	document.addEventListener('touchmove', barTouchMove, true);
	document.addEventListener('touchend', barTouchEnd, true);
	document.addEventListener('touchcancel', barTouchEnd, true);
  
	// Add Mouse Listener
	document.addEventListener('mousedown', barTouchStart, true);
  }

  // Handle the start of gestures
function barTouchStart(evt) {
	//console.log("touch start");

	if(!isBar(evt)){
		return;
	}

	evt.preventDefault();
  
	if(evt.touches && evt.touches.length > 1) {
	  return;
	}

	console.log(getPosfromEvent(evt)+" touch");
	posTouchBar = getPosfromEvent(evt);
	previousDifferenceInY =  0;
	previousDifferenceInX =  0;
  
	// Add the move and end listeners
	if (window.PointerEvent) {
	  evt.target.setPointerCapture(evt.pointerId);
	} else {
	  // Add Mouse Listeners
	  document.addEventListener('mousemove', barTouchMove, true);
	  document.addEventListener('mouseup', barTouchEnd, true);
	}
  
	initialTouchPos = getGesturePointFromEvent(evt);
	console.log(initialTouchPos);
  
	//TODO graphics
	//swipeFrontElement.style.transition = 'initial';
  }


  // Handle end gestures
function barTouchEnd(evt) {
	evt.preventDefault();
  
	if(evt.touches && evt.touches.length > 0) {
	  return;
	}

	//console.log("end");
  
	rafPending = false;
  
	// Remove Event Listeners
	if (window.PointerEvent) {
	  evt.target.releasePointerCapture(evt.pointerId);
	} else {
	  // Remove Mouse Listeners
	  document.removeEventListener('mousemove', barTouchMove, true);
	  document.removeEventListener('mouseup', barTouchEnd, true);
	}
  
	//updateSwipeRestPosition();
  
	initialTouchPos = null;
  };


  function getGesturePointFromEvent(evt) {
    var point = {};

    if(evt.targetTouches) {
      // Prefer Touch Events
      point.x = evt.targetTouches[0].clientX;
      point.y = evt.targetTouches[0].clientY;
    } else {
      // Either Mouse event or Pointer Event
      point.x = evt.clientX;
      point.y = evt.clientY;
    }

    return point;
  }


  function barTouchMove(evt) {
	evt.preventDefault();

	if(!initialTouchPos) {
	  return;
	}
  
	lastTouchPos = getGesturePointFromEvent(evt);
  
	if(rafPending) {
	  return;
	}
  
	rafPending = true;
  
	window.requestAnimFrame(onAnimFrame);
  };

  window.requestAnimFrame = (function(){
	'use strict';

	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			function( callback ){
			  window.setTimeout(callback, 1000 / 60);
			};
  })();

  function onAnimFrame() {
	if(!rafPending) {
	  return;
	}

	var myBar = bars[posTouchBar];
  
	var differenceInY =  lastTouchPos.y - initialTouchPos.y;
	var differenceInX =  lastTouchPos.x - initialTouchPos.x;

	
	if ( (Math.trunc(differenceInY/100) > Math.trunc(previousDifferenceInY/100))  && (myBar.lower < 16)){
		console.log("diffY"+differenceInY);
		myBar.lower = myBar.lower*2;
		draw(myBar, posTouchBar);
	}
	else if ( (Math.trunc(differenceInY/100) < Math.trunc(previousDifferenceInY/100)) && (myBar.lower > 4) ){
		console.log("diffY"+differenceInY);

		myBar.lower = myBar.lower/2;
		draw(myBar, posTouchBar);
	}

	if ( (Math.trunc(differenceInX/100) > Math.trunc(previousDifferenceInX/100))  && (myBar.upper < 4)){
		console.log("diffX"+differenceInX);

		myBar.upper = myBar.upper+1;
		draw(myBar, posTouchBar);
	}
	else if ( (Math.trunc(differenceInX/100) < Math.trunc(previousDifferenceInX/100))  && (myBar.upper > 1) ){
		console.log("diffX"+differenceInX);

		myBar.upper = myBar.upper-1;
		draw(myBar, posTouchBar);
	}

	previousDifferenceInY =  differenceInY;
	previousDifferenceInX =  differenceInX;

  
	/*
	var newXTransform = (currentXPosition - differenceInX)+'px';
	var transformStyle = 'translateX('+newXTransform+')';
	swipeFrontElement.style.webkitTransform = transformStyle;
	swipeFrontElement.style.MozTransform = transformStyle;
	swipeFrontElement.style.msTransform = transformStyle;
	swipeFrontElement.style.transform = transformStyle;
	*/



	rafPending = false;
  }

//HELPER
function isBar(e){
	return e.target && (e.target.id.startsWith("bar") == 1);
}

function getPosfromEvent(e){
	let barId = e.target.id;
	barId = barId.replace("bar", "");
	barId = barId.replace("Box", "");
	barId = barId.replace("First", "");
	return parseInt(barId, 10);
}