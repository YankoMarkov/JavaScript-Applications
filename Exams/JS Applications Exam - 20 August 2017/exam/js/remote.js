let remote = (() => {
	const BASE_URL = 'https://baas.kinvey.com/';
	const APP_KEY = 'kid_SJCsWw0jG'; // APP KEY HERE
	const APP_SECRET = '4eed4009860a42788c542f924e5c1a0c'; // APP SECRET HERE
	
	function makeAuth(auth) {
		if (auth === 'basic') {
			return `Basic ${btoa(APP_KEY + ":" + APP_SECRET)}`;
		} else {
			return `Kinvey ${sessionStorage.getItem('authtoken')}`
		}
	}
	
	function makeRequest(method, module, endpoint, auth) {
		return {
			url: BASE_URL + module + '/' + APP_KEY + '/' + endpoint,
			method: method,
			headers: {
				'Authorization': makeAuth(auth)
			}
		}
	}
	
	function get(module, endpoint, auth) {
		return $.ajax(makeRequest('GET', module, endpoint, auth));
	}
	
	function post(module, endpoint, data, auth) {
		let obj = makeRequest('POST', module, endpoint, auth);
		if (data) {
			obj.data = data;
		}
		return $.ajax(obj);
	}
	
	function update(module, endpoint, data, auth) {
		let obj = makeRequest('PUT', module, endpoint, auth);
		obj.data = data;
		return $.ajax(obj);
	}
	
	function remove(module, endpoint, auth) {
		return $.ajax(makeRequest('DELETE', module, endpoint, auth));
	}
	
	return {
		get,
		post,
		update,
		remove
	}
})();