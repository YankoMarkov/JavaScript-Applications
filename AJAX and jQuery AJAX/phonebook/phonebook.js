$(function () {
	$('#btnLoad').click(loadContacts);
	$('#btnCreate').click(createContact);
	let baseUrl = 'https://phonebook-c27f4.firebaseio.com/phonebook';
	
	function loadContacts() {
		$('#phonebook').empty();
		let req = {
			url: baseUrl + ".json",
			success: displayContacts,
			error: displayError
		};
		$.ajax(req);
	}
	
	function displayContacts(contacts) {
		for (let key in contacts) {
			let name = contacts[key]['name'];
			let phone = contacts[key]['phone'];
			let li = $(`<li><span>${name}: ${phone}</span></li>`);
			li.append($('<button>Delete</button>').click(deleteContact.bind(this, key)));
			$('#phonebook').append(li);
		}
	}
	
	function displayError(err) {
		notify('Error: ' + err.statusText);
	}
	
	function createContact() {
		let contact = {
			name: $('#person').val(),
			phone: $('#phone').val()
		};
		if ($('#person').val() === '') {
			notify('Error: Empty Person');
			return;
		}
		if ($('#phone').val() === '') {
			notify('Error: Empty Phone');
			return;
		}
		let req = {
			url: baseUrl + ".json",
			method: 'POST',
			data: JSON.stringify(contact),
			success: loadContacts,
			error: displayError
		};
		$.ajax(req);
		$('#person').val('');
		$('#phone').val('');
	}
	
	function deleteContact(key) {
		let req = {
			url: `${baseUrl}/${key}.json`,
			method: 'DELETE',
			success: loadContacts,
			error: displayError
		};
		$.ajax(req);
	}
	
	function notify(message) {
		let notify = document.getElementById("notification");
		notify.textContent = message;
		notify.style.display = "block";
		setTimeout(() => notify.style.display = "none", 3000);
	}
});
