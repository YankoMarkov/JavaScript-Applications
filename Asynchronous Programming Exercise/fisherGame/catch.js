function attachEvents() {
	const baseUrl = "https://baas.kinvey.com/appdata/kid_SJZGxBFcz/biggestCatches";
	const user = "guest";
	const pass = "guest";
	const authHeader = {
		'Authorization': 'Basic ' + btoa(`${user}:${pass}`)
	};
	
	$('.load').click(loadCatches);
	$('.add').click(addCatch);
	
	function loadCatches() {
		$.ajax({
			url: `${baseUrl}`,
			headers: authHeader,
			success: displayCatches
		});
		
		function displayCatches(data) {
			let catches = $('#catches');
			catches.empty();
			for (let catche of data) {
				catches
					.append($('<div class="catch">').attr("data-id", catche._id)
						.append($('<label>Angler</label>'))
						.append($('<input type="text" class="angler"/>').val(catche.angler))
						.append($('<label>Weight</label>'))
						.append($('<input type="number" class="weight"/>').val(catche.weight))
						.append($('<label>Species</label>'))
						.append($('<input type="text" class="species"/>').val(catche.species))
						.append($('<label>Location</label>'))
						.append($('<input type="text" class="location"/>').val(catche.location))
						.append($('<label>Bait</label>'))
						.append($('<input type="text" class="bait"/>').val(catche.bait))
						.append($('<label>Capture Time</label>'))
						.append($('<input type="number" class="captureTime"/>').val(catche.captureTime))
						.append($('<button class="update">Update</button>').click(updateData))
						.append($('<button class="delete">Delete</button>').click(() => deleteData(catche))));
			}
		}
	}
	
	function addCatch() {
		let inputs = $('#addForm').find('input');
		
		let catches = {
			angler: $(inputs[0]).val(),
			weight: Number($(inputs[1]).val()),
			species: $(inputs[2]).val(),
			location: $(inputs[3]).val(),
			bait: $(inputs[4]).val(),
			captureTime: Number($(inputs[5]).val())
		};
		$.ajax({
			url: `${baseUrl}`,
			method: 'POST',
			contentType: "application/json",
			headers: authHeader,
			data: JSON.stringify(catches),
			success: loadCatches
		});
		
		for (let input of inputs) {
			$(input).val('');
		}
	}
	
	function updateData(catche) {
		let inputs = $(this).parent().find('input');
		let dataId = $(this).parent().attr('data-id');
		
		let catches = {
			angler: $(inputs[0]).val(),
			weight: $(inputs[1]).val(),
			species: $(inputs[2]).val(),
			location: $(inputs[3]).val(),
			bait: $(inputs[4]).val(),
			captureTime: $(inputs[5]).val()
		};
		$.ajax({
			url: `${baseUrl}/${dataId}`,
			method: 'PUT',
			contentType: "application/json",
			headers: authHeader,
			data: JSON.stringify(catches),
			success: loadCatches
		});
	}
	
	function deleteData(catche) {
		$.ajax({
			url: `${baseUrl}/${catche._id}`,
			method: 'DELETE',
			headers: authHeader,
			success: loadCatches
		});
	}
}