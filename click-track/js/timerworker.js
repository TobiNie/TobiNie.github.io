var timerID=null;
var interval=100;

self.onmessage=function(e){
	if (e.data.timerOneshot) {
		console.log("setting interval");
		interval=e.data.timerOneshot;
		console.log("interval="+interval);
		clearInterval(timerID);
		timerID=setTimeout(function(){ postMessage("tick");}, interval);
		
	}
	else if (e.data=="stop") {
		console.log("stopping");
		clearTimeout(timerID);
		timerID=null;
	}
};

postMessage('hi there');
