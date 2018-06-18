function attachEvents() {
	let baseServiceUrl = "https://messenger-a360d.firebaseio.com/messenger";
	
	function loadMessage() {
		let req = {
			url: `${baseServiceUrl}.json`,
			success: displayMessage
		};
		$.ajax(req);
	}
	
	function createMessage() {
		if ($('#author').val() === '' || $('#content').val() === '') {
			return;
		}
		let data = {
			author: $('#author').val(),
			content: $('#content').val(),
			timestamp: Date.now()
		};
		
		let req = {
			url: `${baseServiceUrl}.json`,
			method: "POST",
			data: JSON.stringify(data),
			success: loadMessage
		};
		$.ajax(req);
	}
	
	function displayMessage(messages) {
		$('#messages').empty();
		let orderedMessages = {};
		messages = Object.keys(messages).sort((a, b) => a.timestamp - b.timestamp).forEach(k => orderedMessages[k] = messages[k]);
		for (let message in orderedMessages) {
			$('#messages').append(`${orderedMessages[message]['author']}: ${orderedMessages[message]['content']}\n`);
		}
		$('#author').val('');
		$('#content').val('');
	}
	
	$('#submit').click(createMessage);
	$('#refresh').click(loadMessage);
	
	loadMessage();
}