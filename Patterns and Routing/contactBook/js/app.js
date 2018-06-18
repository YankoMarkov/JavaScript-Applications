const handlers = {};

$(() => {
	const app = Sammy('#main', function () {
		this.use('Handlebars', 'hbs');
		
		this.get('index.html', function () {
			this.loadPartials({
				header: './templates/header.hbs',
				footer: './templates/footer.hbs'
			}).then(function () {
				this.partial('./templates/welcome.hbs');
			});
		});
		
		this.get('#/register', function () {
			this.loadPartials({
				header: './templates/header.hbs',
				footer: './templates/footer.hbs'
			}).then(function () {
				this.partial('./templates/register.hbs');
			});
		});
		
		this.get('#/contacts', handlers.contacts);
		
		this.get('#/profile', function () {
			this.loadPartials({
				header: './templates/header.hbs',
				footer: './templates/footer.hbs'
			}).then(function () {
				this.partial('./templates/profile.hbs');
			});
		});
		
		this.get('#/logout', function () {
			auth.logout()
				.then(() => {
					localStorage.clear();
					this.redirect('#');
				});
		});
		
		this.post('#/login', function (ctx) {
			let user = ctx.params.username;
			let pass = ctx.params.password;
			auth.login(user, pass)
				.then(function (data) {
					auth.saveSession(data);
					ctx.trigger('user-login');
					ctx.redirect('#/contacts');
				})
		});
		
		this.post('#/register', function () {
		
		});
		
		this.post('#/edit', function () {
		
		});
	});
	app.run();
});