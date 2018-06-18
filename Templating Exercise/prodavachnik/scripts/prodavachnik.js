function startApp() {
	$('header').find('a').show();
	const edit = $('#viewEditAd');
	
	function showView(view) {
		$('section').hide();
		switch (view) {
			case 'home':
				$('#viewHome').show();
				break;
			case 'login':
				$('#viewLogin').show();
				break;
			case 'register':
				$('#viewRegister').show();
				break;
			case 'ads':
				$('#viewAds').show();
				loadAds();
				break;
			case 'create':
				$('#viewCreateAd').show();
				break;
			case 'details':
				$('#viewDetailsAd').show();
				break;
			case 'edit':
				$('#viewEditAd').show();
				break;
		}
	}
	
	const templates = {};
	loadTemplates();
	
	async function loadTemplates() {
		const [addBox, loadAds, editAd, createAd] = await Promise.all([
			$.get('./templates/addBox.html'),
			$.get('./templates/loadAds.html'),
			$.get('./templates/editAd.html'),
			$.get('./templates/createAd.html'),
		]);
		Handlebars.registerPartial('addBox', addBox);
		templates.load = Handlebars.compile(loadAds);
		templates.edit = Handlebars.compile(editAd);
		templates.create = Handlebars.compile(createAd);
	}
	
	// Attach event listeners
	$('#linkHome').click(() => showView('home'));
	$('#linkLogin').click(() => showView('login'));
	$('#linkRegister').click(() => showView('register'));
	$('#linkListAds').click(() => showView('ads'));
	$('#linkCreateAd').click(() => showView('create'));
	$('#linkLogout').click(logout);
	
	$('#buttonLoginUser').click(login);
	$('#buttonRegisterUser').click(register);
	$('#buttonCreateAd').click(createAd);
	$('#buttonEditAd').click(editAd);
	
	
	// Notifications
	$(document).on({
		ajaxStart: () => $('#loadingBox').show(),
		ajaxStop: () => $('#loadingBox').fadeOut()
	});
	
	$('#infoBox').click((event) => $(event.target).hide());
	$('#errorBox').click((event) => $(event.target).hide());
	
	function showInfo(message) {
		$('#infoBox').text(message);
		$('#infoBox').show();
		setTimeout(() => $('#infoBox').fadeOut(), 3000);
	}
	
	function showError(message) {
		$('#errorBox').text(message);
		$('#errorBox').show();
	}
	
	function handleError(reason) {
		showError(reason.responseJSON.description);
	}
	
	let requester = (() => {
		const baseUrl = 'https://baas.kinvey.com';
		const appKey = 'kid_rJm4fV6qG';
		const appSecret = '9443134aa3f444288c33a5338bd914ae';
		
		function makeAuth(type) {
			if (type === 'basic') {
				return 'Basic ' + btoa(`${appKey}:${appSecret}`);
			} else {
				return 'Kinvey ' + localStorage.getItem('authtoken');
			}
		}
		
		function makeRequest(method, module, url, auth) {
			return req = {
				url: `${baseUrl}/${module}/${appKey}/${url}`,
				method,
				headers: {
					'Authorization': makeAuth(auth)
				}
			};
		}
		
		function get(module, url, auth) {
			return $.ajax(makeRequest('GET', module, url, auth));
		}
		
		function post(module, url, data, auth) {
			let req = makeRequest('POST', module, url, auth);
			req.data = JSON.stringify(data);
			req.contentType = 'application/json';
			return $.ajax(req);
		}
		
		function update(module, url, data, auth) {
			let req = makeRequest('PUT', module, url, auth);
			req.data = JSON.stringify(data);
			req.contentType = 'application/json';
			return $.ajax(req);
		}
		
		function remove(module, url, auth) {
			return $.ajax(makeRequest('DELETE', module, url, auth));
		}
		
		return {
			get, post, update, remove
		}
	})();
	
	if (localStorage.getItem('authtoken') !== null &&
		localStorage.getItem('username') !== null) {
		userLoggedIn();
	} else {
		userLoggedOut();
	}
	showView('home');
	
	function userLoggedIn() {
		$('#loggedInUser').text(`Welcome, ${localStorage.getItem('username')}!`);
		$('#loggedInUser').show();
		$('#linkLogin').hide();
		$('#linkRegister').hide();
		$('#linkLogout').show();
		$('#linkListAds').show();
		$('#linkCreateAd').show();
	}
	
	function userLoggedOut() {
		$('#loggedInUser').text('');
		$('#loggedInUser').hide();
		$('#linkLogin').show();
		$('#linkRegister').show();
		$('#linkLogout').hide();
		$('#linkListAds').hide();
		$('#linkCreateAd').hide();
	}
	
	function saveSession(data) {
		localStorage.setItem('username', data.username);
		localStorage.setItem('id', data._id);
		localStorage.setItem('authtoken', data._kmd.authtoken);
		userLoggedIn();
	}
	
	async function login() {
		let form = $('#formLogin');
		let username = form.find('input[name="username"]').val();
		let password = form.find('input[name="passwd"]').val();
		
		try {
			let data = await requester.post('user', 'login', {username, password}, 'basic');
			showInfo('Logged in');
			saveSession(data);
			showView('ads');
		} catch (err) {
			handleError(err);
		}
	}
	
	async function register() {
		let form = $('#formRegister');
		let username = form.find('input[name="username"]').val();
		let password = form.find('input[name="passwd"]').val();
		
		try {
			let data = await requester.post('user', '', {username, password}, 'basic');
			showInfo('Registered');
			saveSession(data);
			showView('ads');
		} catch (err) {
			handleError(err);
		}
	}
	
	async function logout() {
		try {
			let data = await requester.post('user', '_logout', {authtoken: localStorage.getItem('authtoken')});
			localStorage.clear();
			showInfo('Logged out');
			userLoggedOut();
			showView('home');
		} catch (err) {
			handleError(err);
		}
	}
	
	async function loadAds() {
		let content = $('#content');
		content.empty();
		let ads = await requester.get('appdata', 'posts');
		
		ads.forEach(ad => {
			if (ad._acl.creator === localStorage.getItem('id')) {
				ad.isAuthor = true;
			}
		});
		let context = {
			ads
		};
		content.html(templates.load(context));
		let editBtn = $(content).find('.ad-box').find('.edit');
		editBtn.click(openEditAd);
		let deleteBtn = $(content).find('.ad-box').find('.delete');
		deleteBtn.click(deleteAd);
	}
	
	async function deleteAd() {
		let id = $(this).parent().attr('data-id');
		await requester.remove('appdata', 'posts/' + id);
		showInfo('Ad deleted');
		showView('ads');
	}
	
	async function openEditAd() {
		let id = $(this).parent().attr('data-id');
		let ad = await requester.get('appdata', 'posts/' + id);
		let context = {
			ad
		};
		edit.html(templates.edit(context));
		
		edit.find('input[name="title"]').val(ad.title);
		edit.find('textarea[name="description"]').val(ad.description);
		edit.find('input[name="price"]').val(Number(ad.price));
		edit.find('input[name="image"]').val(ad.imageUrl);
		edit.find('input[name="id"]').val(ad._id);
		edit.find('input[name="publisher"]').val(ad.publisher);
		edit.find('input[name="date"]').val(ad.date);
		showView('edit');
	}
	
	async function editAd() {
		let title = edit.find('input[name="title"]').val();
		let description = edit.find('textarea[name="description"]').val();
		let price = edit.find('input[name="price"]').val();
		let imageUrl = edit.find('input[name="image"]').val();
		let id = edit.find('input[name="id"]').val();
		let publisher = edit.find('input[name="publisher"]').val();
		let date = edit.find('input[name="date"]').val();
		
		if (title.length === 0) {
			showError('Title cannot be empty');
			return;
		}
		if (Number.isNaN(price)) {
			showError('Price cannot be empty');
			return;
		}
		
		let editedAd = {
			title, description, price, imageUrl, date, publisher
		};
		
		try {
			await requester.update('appdata', 'posts/' + id, editedAd);
			showInfo('Ad editted');
			showView('ads');
		} catch (err) {
			handleError(err);
		}
	}
	
	async function createAd() {
		console.log(templates.create());
		let createAd = $('#viewCreateAd');
		createAd.html(templates.create(templates.create[0]));
		let title = createAd.find('input[name="title"]').val();
		let description = createAd.find('textarea[name="description"]').val();
		let price = Number(createAd.find('input[name="price"]').val());
		let imageUrl = createAd.find('input[name="image"]').val();
		let date = (new Date()).toString('yyyy-MM-dd');
		let publisher = localStorage.getItem('username');
		
		if (title.length === 0) {
			showError('Title cannot be empty');
			return;
		}
		if (Number.isNaN(price)) {
			showError('Price cannot be empty');
			return;
		}
		
		let newAd = {
			title, description, price, imageUrl, date, publisher
		};
		
		try {
			await requester.post('appdata', 'posts', newAd);
			showInfo('Ad created');
			showView('ads');
		} catch (err) {
			handleError(err);
		}
		
	}
}