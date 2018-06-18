let service = (() => {
	
	function getAllPost() {
		let endPoint = 'posts?query={}&sort={"_kmd.ect": -1}';
		return remote.get('appdata', endPoint);
	}
	
	function createPost(author, title, description, url, imageUrl) {
		let data = {author, title, description, url, imageUrl};
		return remote.post('appdata', 'posts', data);
	}
	
	function editPost(postId, author, title, description, url, imageUrl) {
		let data = {author, title, description, url, imageUrl};
		let endPoint = `posts/${postId}`;
		return remote.update('appdata', endPoint, data);
	}
	
	function deletePost(postId) {
		let endPoint = `posts/${postId}`;
		return remote.remove('appdata', endPoint);
	}
	
	function getMyPosts(username) {
		let endPoint = `posts?query={"author":"${username}"}&sort={"_kmd.ect": -1}`;
		return remote.get('appdata', endPoint);
	}
	
	function getPost(postId) {
		let endPoint = `posts/${postId}`;
		return remote.get('appdata', endPoint);
	}
	
	function getPostComments(postId) {
		let endPoint = `comments?query={"postId":"${postId}"}&sort={"_kmd.ect": -1}`;
		return remote.get('appdata', endPoint);
	}
	
	function createComments(postId, content, author) {
		let data = {postId, content, author};
		return remote.post('appdata', 'comments', data);
	}
	
	function deleteComments(commentsId) {
		let endPoint = `comments/${commentsId}`;
		return remote.get('appdata', endPoint);
	}
	
	return {
		getAllPost,
		createPost,
		editPost,
		deletePost,
		getMyPosts,
		getPost,
		getPostComments,
		createComments,
		deleteComments
	}
})();