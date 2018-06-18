function getInfo() {
	let input = $('#stopId').val();
	$('#stopName').text('');
	$('#buses').empty();
	
	let req = {
		url: `https://judgetests.firebaseio.com/businfo/${input}.json`,
		success: loadBuses,
		error: loadError
	};
	$.ajax(req);
	
	function loadBuses(busStop) {
		$('#stopName').text(busStop.name);
		
		for (let bus in busStop.buses) {
			$('#buses').append($('<li>').text(`Bus ${bus} arrives in ${busStop['buses'][bus]} minutes`))
		}
	}
	
	function loadError(err) {
		$('#stopName').text('Error');
	}
}