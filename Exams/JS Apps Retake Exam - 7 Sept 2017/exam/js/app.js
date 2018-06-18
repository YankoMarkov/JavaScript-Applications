$(() => {
	const app = Sammy('#main', function () {
		this.use('Handlebars', 'hbs');
		
		this.get('index.html', function (ctx) {
			ctx.redirect('#/home');
		});
		
		this.get('#/home', function (ctx) {
			if (!auth.isAuth()) {
				ctx.redirect('#/login');
				return;
			}
			ctx.username = localStorage.getItem('username');
			ctx.filter = ctx.params.filter;
			if (ctx.filter) {
				if (ctx.filter === ctx.username) {
					ctx.isMe = true;
				} else {
					ctx.isFollowing = service.isFollowing(ctx.filter);
				}
			} else {
				ctx.isMe = true;
			}
			ctx.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
				menu: './templates/common/menu.hbs',
				chirpList: './templates/common/chirpList.hbs',
				chirp: './templates/common/chirp.hbs',
				stats: './templates/common/stats.hbs',
			}).then(function () {
				ctx.partials = this.partials;
				this.partial('./templates/home.hbs');
				
				service.getChirps(ctx.filter)
					.then(function (chirps) {
						chirps.map(c => {
							c.time = calcTime(c._kmd.ect);
							c.isAuthor = c._acl.creator === localStorage.getItem('id')
						});
						ctx.render('./templates/common/chirpList.hbs', {chirps})
							.then(function () {
								this.replace('#chirps');
							});
					}).catch(notify.handleError);
				
				service.getStats(ctx.filter || ctx.username)
					.then(function (stats) {
						stats = {
							chirps: stats[0],
							following: stats[1],
							followers: stats[2].length
						};
						ctx.render('./templates/common/stats.hbs', {stats})
							.then(function () {
								this.replace('#userStats');
							});
					}).catch(notify.handleError);
			})
		});
		
		this.get('#/register', function () {
			this.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
			}).then(function () {
				this.partial('./templates/register.hbs')
			}).catch(notify.handleError);
		});
		
		this.post('#/register', function (ctx) {
			let user = ctx.params.username;
			let pass = ctx.params.password;
			let repeatPass = ctx.params.repeatPass;
			
			if (!/^\w{5,}$/.test(user)) {
				notify.showError('Username should be at least 5 characters long');
			} else if (user === '' || pass === '' || repeatPass === '') {
				notify.showError('All fields should be non-empty!');
			} else if (pass !== repeatPass) {
				notify.showError('Password must match!');
			} else {
				auth.register(user, pass)
					.then(function (userData) {
						auth.saveSession(userData);
						notify.showInfo('User registration successful.');
						ctx.redirect('#/home');
					}).catch(notify.handleError);
			}
		});
		
		this.get('#/login', function () {
			this.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
			}).then(function () {
				this.partial('./templates/login.hbs')
			}).catch(notify.handleError);
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
						ctx.redirect('#/home');
					}).catch(notify.handleError);
			}
		});
		
		this.get('#/logout', function (ctx) {
			auth.logout()
				.then(function () {
					sessionStorage.clear();
					ctx.redirect('#/home');
				}).catch(notify.handleError);
		});
		
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

