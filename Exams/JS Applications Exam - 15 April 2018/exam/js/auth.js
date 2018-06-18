let auth = (() => {
	function isAuth() {
		return sessionStorage.getItem('authtoken') !== null;
	}
	
	function saveSession(data) {
		sessionStorage.setItem('username', data.username);
		sessionStorage.setItem('userId', data._id);
		sessionStorage.setItem('authtoken', data._kmd.authtoken);
	}
	
	function login(username, password) {
		return remote.post('user', 'login', {username, password}, 'basic');
	}
	
	async function register(username, password) {
		return remote.post('user', '', {username, password}, 'basic');
	}
	
	async function logout() {
		return remote.post('user', '_logout', {authtoken: sessionStorage.getItem('authtoken')});
	}
	
	return {
		saveSession, login, register, logout, isAuth
	}
})();