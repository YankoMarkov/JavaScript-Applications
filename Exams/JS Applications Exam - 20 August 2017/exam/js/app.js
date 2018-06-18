$(() => {
	let app = Sammy('#main', function () {
		this.use('Handlebars', 'hbs');
		
		this.get('#/home', welcomeDisplay);
		this.get('index.html', welcomeDisplay);
		
		this.post('#/register', function (ctx) {
			let user = ctx.params.username;
			let pass = ctx.params.password;
			let repeatPass = ctx.params.repeatPass;
			
			if (!/^[A-Za-z]{3,}$/.test(user)) {
				notify.showError('Username must be more then 3 alphabet symbols!');
			} else if (!/^[A-Za-z\d]{6,}$/.test(pass)) {
				notify.showError('Password must be more then 6 symbols!');
			} else if (pass !== repeatPass) {
				notify.showError('Password must match!');
			} else {
				auth.register(user, pass)
					.then(function (userData) {
						auth.saveSession(userData);
						notify.showInfo('User registration successful.');
						ctx.redirect('#/catalog');
					})
					.cache(notify.handleError);
			}
		});
		
		this.post('#/login', function (ctx) {
			let user = ctx.params.username;
			let pass = ctx.params.password;
			
			if (user === '' || pass === '') {
				notify.showError('All fields should be non-empty!');
			} else {
				auth.login(user, pass)
					.then(function (userData) {
						auth.saveSession(userData);
						notify.showInfo('Login successful.');
						ctx.redirect('#/catalog');
					})
					.cache(notify.handleError);
			}
		});
		
		this.get('#/logout', function (ctx) {
			auth.logout()
				.then(function () {
					sessionStorage.clear();
					ctx.redirect('#/home');
				})
				.cache(notify.handleError);
		});
		
		this.get('#/catalog', function (ctx) {
			if (!auth.isAuth()) {
				ctx.redirect('#/home');
				return;
			}
			service.getAllPost()
				.then(function (posts) {
					posts.forEach((p, i) => {
						p.rank = i + 1;
						p.date = calcTime(p._kmd.ect);
						p.isAuthor = p._acl.creator === sessionStorage.getItem('userId');
					});
					ctx.isAuthor = auth.isAuth();
					ctx.username = sessionStorage.getItem('username');
					ctx.posts = posts;
					
					ctx.loadPartials({
						header: './templates/common/header.hbs',
						footer: './templates/common/footer.hbs',
						menu: './templates/common/menu.hbs',
						postList: './templates/common/postList.hbs',
						post: './templates/common/post.hbs'
					}).then(function () {
						this.partial('./templates/catalog.hbs');
					})
				})
				.cache(notify.handleError);
		});
		
		this.get('#/create/post', function (ctx) {
			if (!auth.isAuth()) {
				ctx.redirect('#/home');
				return;
			}
			ctx.username = sessionStorage.getItem('username');
			ctx.isAuthor = auth.isAuth();
			
			ctx.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
				menu: './templates/common/menu.hbs'
			}).then(function () {
				this.partial('./templates/createPost.hbs');
			}).cache(notify.handleError);
		});
		
		this.post('#/create/post', function (ctx) {
			if (!auth.isAuth()) {
				ctx.redirect('#/home');
				return;
			}
			let author = sessionStorage.getItem('username');
			let url = ctx.params.url;
			let title = ctx.params.title;
			let imageUrl = ctx.params.imageUrl;
			let description = ctx.params.description;
			
			if (title === '') {
				notify.showError('Title is required!');
			} else if (url === '') {
				notify.showError('Url is required!');
			} else if (!url.startsWith('https:')) {
				notify.showError('Url must be a valid link!');
			} else {
				service.createPost(author, title, description, url, imageUrl)
					.then(function () {
						notify.showInfo('Post created.');
						ctx.redirect('#/catalog');
					})
					.cache(notify.handleError);
			}
		});
		
		this.get('#/edit/post/:postId', function (ctx) {
			if (!auth.isAuth()) {
				ctx.redirect('#/home');
				return;
			}
			let postId = ctx.params.postId;
			
			service.getPost(postId)
				.then(function (post) {
					ctx.username = sessionStorage.getItem('username');
					ctx.isAuthor = auth.isAuth();
					ctx.post = post;
					
					ctx.loadPartials({
						header: './templates/common/header.hbs',
						footer: './templates/common/footer.hbs',
						menu: './templates/common/menu.hbs',
					}).then(function () {
						this.partial('./templates/editPost.hbs');
					}).cache(notify.handleError);
				}).cache(notify.handleError);
		});
		
		this.post('#/edit/post', function (ctx) {
			let postId = ctx.params.postId;
			let author = sessionStorage.getItem('username');
			let title = ctx.params.title;
			let url = ctx.params.url;
			let imageUrl = ctx.params.imageUrl;
			let description = ctx.params.description;
			
			service.editPost(postId, author, title, description, url, imageUrl)
				.then(function () {
					notify.showInfo(`Post ${title} updated.`);
					ctx.redirect('#/catalog');
				}).cache(notify.handleError);
		});
		
		this.get('#/delete/post/:postId', function (ctx) {
			if (!auth.isAuth()) {
				ctx.redirect('#/home');
				return;
			}
			let postId = ctx.params.postId;
			
			service.deletePost(postId)
				.then(function () {
					notify.showInfo('Post deleted.');
					ctx.redirect('#/catalog');
				}).cache(notify.handleError);
		});
		
		this.get('#/posts', function (ctx) {
			if (!auth.isAuth()) {
				ctx.redirect('#/home');
				return;
			}
			let username = sessionStorage.getItem('username');
			
			service.getMyPosts(username)
				.then(function (posts) {
					posts.forEach((p, i) => {
						p.rank = i + 1;
						p.date = calcTime(p._kmd.ect);
						p.isAuthor = p._acl.creator === sessionStorage.getItem('userId');
					});
					
					ctx.isAuthor = auth.isAuth();
					ctx.username = sessionStorage.getItem('username');
					ctx.posts = posts;
					
					ctx.loadPartials({
						header: './templates/common/header.hbs',
						footer: './templates/common/footer.hbs',
						menu: './templates/common/menu.hbs',
						postList: './templates/common/postList.hbs',
						post: './templates/common/post.hbs'
					}).then(function () {
						this.partial('./templates/myPost.hbs');
					}).cache(notify.handleError);
				}).cache(notify.handleError);
		});
		
		this.get('#/comments/:postId', function (ctx) {
			let postId = ctx.params.postId;
			
			const postPromise = service.getPost(postId);
			const commentsPromise = service.getPostComments(postId);
			
			Promise.all([postPromise, commentsPromise])
				.then(function ([post, comments]) {
					post.isAuthor = post._acl.creator === sessionStorage.getItem('userId');
					post.data = calcTime(post._kmd.ect);
					comments.forEach((c) => {
						c.commentAuthor = c._acl.creator === sessionStorage.getItem('userId');
						c.data = calcTime(c._kmd.ect);
					});
					
					ctx.isAuthor = auth.isAuth();
					ctx.username = sessionStorage.getItem('username');
					ctx.post = post;
					ctx.comments = comments;
					
					ctx.loadPartials({
						header: './templates/common/header.hbs',
						footer: './templates/common/footer.hbs',
						menu: './templates/common/menu.hbs',
						commentList: './templates/common/commentList.hbs',
						comment: './templates/common/comment.hbs',
						postDetails: './templates/common/postDetails.hbs',
						createComment: './templates/common/createComment.hbs'
					}).then(function () {
						this.partial('./templates/postDetailsPage.hbs');
					}).cache(notify.handleError);
				}).catch(notify.handleError);
		});
		
		this.post('#/comments/create', function (ctx) {
			let author = sessionStorage.getItem('username');
			let content = ctx.params.content;
			let postId = ctx.params.postId;
			
			if (content === '') {
				notify.showError('Cannot add empty comment!');
			} else {
				service.createComments(postId, content, author)
					.then(function () {
						notify.showInfo('Comment created!');
						ctx.redirect(`#/comments/${postId}`);
					}).cache(notify.handleError);
			}
		});
		
		this.get('#/comments/delete/:commentId/post/:postId', function (ctx) {
			let commentId = ctx.params.commentId;
			let postId = ctx.params.postId;
			
			service.deleteComments(commentId)
				.then(function () {
					notify.showInfo('Comment deleted.');
					ctx.redirect(`#/comments/${postId}`);
				}).cache(notify.handleError);
		});
		
		function welcomeDisplay(ctx) {
			if (auth.isAuth()) {
				ctx.redirect('#/catalog');
			} else {
				ctx.loadPartials({
					header: './templates/common/header.hbs',
					footer: './templates/common/footer.hbs',
					login: './templates/common/login.hbs',
					register: './templates/common/register.hbs'
				}).then(function () {
					this.partial('./templates/welcome.hbs');
				}).catch(notify.handleError);
			}
		}
		
		function calcTime(dateIsoFormat) {
			let diff = new Date - (new Date(dateIsoFormat));
			diff = Math.floor(diff / 60000);
			if (diff < 1) return 'less than a minute';
			if (diff < 60) return diff + ' minute' + pluralize(diff);
			diff = Math.floor(diff / 60);
			if (diff < 24) return diff + ' hour' + pluralize(diff);
			diff = Math.floor(diff / 24);
			if (diff < 30) return diff + ' day' + pluralize(diff);
			diff = Math.floor(diff / 30);
			if (diff < 12) return diff + ' month' + pluralize(diff);
			diff = Math.floor(diff / 12);
			return diff + ' year' + pluralize(diff);
			
			function pluralize(value) {
				if (value !== 1) return 's';
				else return '';
			}
		}
	});
	app.run();
});