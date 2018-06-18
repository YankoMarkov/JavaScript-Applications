let auth = (() => {
	function isAuth() {
		return sessionStorage.getItem('authtoken') !== null;
	}
	
	function saveSession(data) {
		sessionStorage.setItem('username', data.username);
		sessionStorage.setItem('id', data._id);
		sessionStorage.setItem('subscriptions', JSON.stringify(data.subscriptions));
		sessionStorage.setItem('authtoken', data._kmd.authtoken);
	}
	
	function login(username, password) {
		return remote.post('user', 'login', {username, password}, 'basic');
	}
	
	async function register(username, password) {
		return remote.post('user', '', {username, password, subscriptions: []}, 'basic');
	}
	
	async function logout() {
		return remote.post('user', '_logout', {authtoken: sessionStorage.getItem('authtoken')});
	}
	
	return {
		saveSession, login, register, logout, isAuth
	}
})();