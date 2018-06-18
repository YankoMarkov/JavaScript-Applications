function attachEvents() {
	const baseUrl = 'https://baas.kinvey.com/appdata/kid_rJQ1eEI5M/';
	const username = 'peter';
	const pass = 'p';
	const posts = $('#posts');
	const authHeader = {
		'Authorization': 'Basic ' + btoa(`${username}:${pass}`)
	};
	
	$('#btnLoadPosts').click(loadPost);
	$('#btnViewPost').click(viewPost);
	
	function request(urlEnd) {
		return $.ajax({
			url: `${baseUrl}${urlEnd}`,
			headers: authHeader
		});
	}
	
	function loadPost() {
		request('posts')
			.then(fillSelect)
			.catch(displayError);
		
		function fillSelect(data) {
			posts.empty();
			for (let post of data) {
				posts.append($('<option>').text(post.title).val(post._id));
			}
		}
	}
	
	function viewPost() {
		let postId = posts.find('option:selected').val();
		console.log(postId);
		let requestPosts = request(`posts/${postId}`);
		let requestComments = request(`comments/?query={"postId":"${postId}"}`);
		
		Promise.all([requestPosts, requestComments])
			.then(displayPostAndComments)
			.catch(displayError);
		
		function displayPostAndComments([post, comments]) {
			$('#post-title').text(post.title);
			$('#post-body').text(post.body);
			let ul = $('#post-comments');
			ul.empty();
			for (let comment of comments) {
				ul.append($(`<li>${comment.text}</li>`));
			}
			if (comments.length === 0) {
				ul.append($('<li><i>No comments yet</i></li>'));
			}
		}
	}
	
	function displayError(err) {
		let errorDiv = $("<div>").text(`Error: ${err.status}(${err.statusText})`);
		$(document.body).prepend(errorDiv);
		
		setTimeout(function () {
			$(errorDiv).fadeOut(function () {
				$(errorDiv).remove();
			});
		}, 3000);
	}
}