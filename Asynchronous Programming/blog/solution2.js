function attachEvents() {
	const baseUrl = 'https://baas.kinvey.com/appdata/kid_rJQ1eEI5M/';
	const username = 'peter';
	const pass = 'p';
	const posts = $('#posts');
	const content = $('#content');
	const authHeader = {
		'Authorization': 'Basic ' + btoa(`${username}:${pass}`)
	};
	
	posts.on('change', viewPost);
	loadPost();
	
	function request(urlEnd) {
		return $.ajax({
			url: `${baseUrl}${urlEnd}`,
			headers: authHeader
		});
	}
	
	async function loadPost() {
		posts.empty();
		posts.append($('<option>Loading...</option>'));
		posts.prop('disabled', true);
		try {
			let data = await request('posts');
			posts.empty();
			for (let post of data) {
				posts.append($('<option>').text(post.title).val(post._id));
			}
			if (data.length !== 0) {
				viewPost();
			}
		} catch (exception) {
			displayError(exception);
		} finally {
			posts.prop('disabled', false);
		}
	}
	
	async function viewPost() {
		posts.prop('disabled', true);
		content.empty();
		content.append($('<span><i>Loading...</i></span>'));
		let postId = posts.find('option:selected').val();
		let requestPosts = request(`posts/${postId}`);
		let requestComments = request(`comments/?query={"postId":"${postId}"}`);
		try {
			let [post, comments] = await Promise.all([requestPosts, requestComments]);
			content.empty();
			content.append($(`<h1>${post.title}</h1>`))
				.append($(`<ul>${post.body}</ul>`))
				.append($('<h2>Comments</h2>'));
			let ul = $('<ul>');
			
			for (let comment of comments) {
				ul.append($(`<li>${comment.text}</li>`));
			}
			if (comments.length === 0) {
				ul.append($('<li><i>No comments yet</i></li>'));
			}
			content.append(ul);
			posts.prop('disabled', false);
		} catch (exception) {
			displayError(exception);
		} finally {
			posts.prop('disabled', false);
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