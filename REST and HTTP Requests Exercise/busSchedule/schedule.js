function schedule() {
	let nextStopId = 'depot';
	let currentStopName = undefined;
	
	function depart() {
		let req = {
			url: `https://judgetests.firebaseio.com/schedule/${nextStopId}.json`,
			success: nextStop,
			error: loadError
		};
		$.ajax(req);
		$('#depart').attr('disabled', true);
	}
	
	function arrive() {
		$('#info').text(`Arriving at ${currentStopName}`);
		$('#depart').removeAttr('disabled');
		$('#arrive').attr('disabled', true);
	}
	
	function nextStop(nextStop) {
		$('#info').text(`Next stop ${nextStop.name}`);
		currentStopName = nextStop.name;
		nextStopId = nextStop.next;
		$('#arrive').removeAttr('disabled');
	}
	
	function loadError(err) {
		$('#info').text("Error");
		$('#depart').attr('disabled', true);
		$('#arrive').attr('disabled', true);
	}
	
	return {
		depart,
		arrive
	};
}