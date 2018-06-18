let service = (() => {
	
	function getChirps(filter) {
		if (filter) {
			return new Promise((resolve, reject) => {
				// Resolve user ID
				remote.get('user', `?query={"username":"${filter}"}`).then((data) => {
					if (data.length !== 1) reject('No such user in database');
					let userId = data[0]._id;
					// Fetch related posts
					remote.get('appdata', `chirps?query={"_acl.creator":"${userId}"}&sort={"_kmd.ect": -1}`)
						.then(resolve)
						.catch(reject);
				}).catch(reject);
			});
		} else {
			const sub = sessionStorage.getItem('subscriptions');
			const url = `chirps?query={"author":{"$in": ${sub}}&sort={"_kmd.ect": 1}`;
			return remote.get('appdata', url);
		}
	}
	
	function postChirp(text, author) {
		let data = {text, author};
		return remote.post('appdata', 'chirps', data);
	}
	
	function deleteChirp(chirpId) {
		const url = `chirps/${chirpId}`;
		return remote.remove('appdata', url);
	}
	
	function getUserChirps(username) {
		const url = `chirps?query={"author":"${username}"}&sort={"_kmd.ect": 1}`;
		return remote.get('appdata', url);
	}
	
	async function countChirps(username) {
		return (await getUserChirps(username)).length;
	}
	
	async function countFollowing(username) {
		const url = `?query={"subscriptions":"${username}"}`;
		return (await remote.get('user', url))[0].subscriptions.length;
	}
	
	async function countFollowers(username) {
		const url = `?query={"subscriptions":"${username}"}`;
		return (await remote.get('user', url)).length;
	}
	
	async function follow(userTarget) {
		const userId = sessionStorage.getItem('id');
		const subscriptions = (await remote.get('user', userId)).subscriptions || [];
		subscriptions.push(userTarget);
		try {
			const res = await remote.update('user', userId, {subscriptions});
			sessionStorage.setItem('subscriptions', JSON.stringify(res.subscriptions));
		} catch (err) {
			notify.handleError(err);
		}
	}
	
	async function unfollow(userTarget) {
		const userId = sessionStorage.getItem('id');
		let subscriptions = (await remote.get('user', userId)).subscriptions || [];
		subscriptions = subscriptions.filter(u => u !== userTarget);
		try {
			const res = await remote.update('user', userId, {subscriptions});
			sessionStorage.setItem('subscriptions', JSON.stringify(res.subscriptions));
		} catch (err) {
			notify.handleError(err);
		}
	}
	
	function getStats(username) {
		let chirps = service.countChirps(username);
		let following = service.countFollowing(username);
		let followers = service.countFollowers(username);
		
		return Promise.all([chirps, following, followers]);
	}
	
	return {
		getChirps,
		postChirp,
		deleteChirp,
		getUserChirps,
		countChirps,
		countFollowing,
		countFollowers,
		follow,
		unfollow,
		getStats
	}
})();