let auth = (() => {
	function isAuth() {
		return sessionStorage.getItem('authtoken') !== null;
	}
	
	function saveSession(userData) {
		sessionStorage.setItem('authtoken', userData._kmd.authtoken);
		sessionStorage.setItem('username', userData.username);
		sessionStorage.setItem('userId', userData._id);
	}
	
	
	function register(username, password) {
		let obj = {username, password};
		
		return remote.post('user', '', obj, 'basic');
	}
	
	function login(username, password) {
		let obj = {username, password};
		
		return remote.post('user', 'login', obj, 'basic')
	}
	
	function logout() {
		return remote.post('user', '_logout');
	}
	
	return {
		isAuth,
		login,
		logout,
		register,
		saveSession
	}
})();