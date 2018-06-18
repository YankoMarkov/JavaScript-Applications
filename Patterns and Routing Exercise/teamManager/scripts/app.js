$(() => {
	const app = Sammy('#main', function () {
		this.use('Handlebars', 'hbs');
		
		this.get('index.html', displayHome);
		
		this.get('#/home', displayHome);
		
		this.get('#/about', function (ctx) {
			ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
			ctx.username = sessionStorage.getItem('username');
			if (ctx.loggedIn) {
				ctx.hasTeam = sessionStorage.getItem('teamId');
			}
			this.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
			}).then(function () {
				this.partial('./templates/about/about.hbs');
			})
		});
		
		this.get('#/login', function (ctx) {
			ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
			ctx.username = sessionStorage.getItem('username');
			this.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
				loginForm: './templates/login/loginForm.hbs',
			}).then(function () {
				this.partial('./templates/login/loginPage.hbs');
			})
		});
		
		this.post('#/login', function (ctx) {
			let user = ctx.params.username;
			let pass = ctx.params.password;
			auth.login(user, pass)
				.then(function (userInfo) {
					auth.saveSession(userInfo);
					auth.showInfo('LOGGED IN!');
					displayHome(ctx);
				}).catch(auth.handleError);
		});
		
		this.get('#/logout', function (ctx) {
			auth.logout()
				.then(function () {
					sessionStorage.clear();
					auth.showInfo('LOGGED OUT!');
					displayHome(ctx);
				}).catch(auth.handleError);
		});
		
		this.get('#/register', function (ctx) {
			ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
			ctx.username = sessionStorage.getItem('username');
			this.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
				registerForm: './templates/register/registerForm.hbs',
			}).then(function () {
				this.partial('./templates/register/registerPage.hbs');
			})
		});
		
		this.post('#/register', function (ctx) {
			console.log("Registrira se");
			let user = ctx.params.username;
			let pass = ctx.params.password;
			let repeatPass = ctx.params.repeatPassword;
			if (pass !== repeatPass) {
				auth.handleError('PASSWORD DO NOT MATCH!');
			} else {
				auth.register(user, pass)
					.then(function (userInfo) {
						auth.saveSession(userInfo);
						auth.showInfo('REGISTERED!');
						displayHome(ctx);
					}).catch(auth.handleError);
			}
		});
		
		this.get('#/catalog', displayCatalog);
		
		this.get('#/create', function (ctx) {
			ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
			ctx.username = sessionStorage.getItem('username');
			ctx.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
				createForm: './templates/create/createForm.hbs'
			}).then(function () {
				this.partial('./templates/create/createPage.hbs')
			})
		});
		
		this.post('#/create', function (ctx) {
			let name = ctx.params.name;
			let comment = ctx.params.comment;
			teamsService.createTeam(name, comment)
				.then(function (teamInfo) {
					teamsService.joinTeam(teamInfo._id)
						.then(function (userInfo) {
							auth.saveSession(userInfo);
							auth.showInfo(`Team ${name} created!`);
							displayCatalog(ctx);
						}).catch(auth.handleError);
				}).catch(auth.handleError);
		});
		
		this.get('#/catalog/:id', function (ctx) {
			let teamId = ctx.params.id.substr(1);
			teamsService.loadTeamDetails(teamId)
				.then(function (teamInfo) {
					ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
					ctx.username = sessionStorage.getItem('username');
					ctx.teamId = teamId;
					ctx.name = teamInfo.name;
					ctx.comment = teamInfo.comment;
					ctx.isOnTeam = teamInfo._id === sessionStorage.getItem(teamId);
					ctx.isAuthor = teamInfo._acl.creator === sessionStorage.getItem('userId');
					ctx.loadPartials({
						header: './templates/common/header.hbs',
						footer: './templates/common/footer.hbs',
						teamMember: './templates/catalog/teamMember.hbs',
						teamControls: './templates/catalog/teamControls.hbs'
					}).then(function () {
						this.partial('./templates/catalog/details.hbs');
					})
				});
		});
		
		this.get('#/join/:id', function (ctx) {
			let teamId = ctx.params.id.substr(1);
			teamsService.joinTeam(teamId)
				.then(function (userInfo) {
					auth.saveSession(userInfo);
					auth.showInfo('JOINED TO TEAM!')
					displayCatalog(ctx);
				}).catch(auth.handleError);
		});
		
		this.get('#/leave', function (ctx) {
			teamsService.loadTeams()
				.then(function (userInfo) {
					auth.saveSession(userInfo);
					auth.showInfo('LEFT THE TEAM!');
					displayCatalog(ctx);
				}).catch(auth.handleError);
		});
		
		this.get('$/edit/:id', function (ctx) {
			let teamId = ctx.params.id.substr(1);
			teamsService.loadTeamDetails(teamId)
				.then(function (teamInfo) {
					ctx.teamId = teamId;
					ctx.name = teamInfo.name;
					ctx.comment = teamInfo.comment;
					ctx.loadPartials({
						header: './templates/common/header.hbs',
						footer: './templates/common/footer.hbs',
						editForm: './templates/edit/editForm.hbs'
					}).then(function () {
						this.partial('./templates/edit/editPage.hbs')
					})
				}).catch(auth.handleError);
		});
		
		this.post('$/edit/:id', function (ctx) {
			let teamId = ctx.params.id.substr(1);
			let name = ctx.params.name;
			let comment = ctx.params.comment;
			teamsService.edit(teamId, name, comment)
				.then(function () {
					auth.showInfo(`Team ${teamId} edited!`);
					displayCatalog(ctx);
				}).catch(auth.handleError);
		});
		
		function displayCatalog(ctx) {
			ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
			ctx.username = sessionStorage.getItem('username');
			teamsService.loadTeams()
				.then(function (teams) {
					ctx.hasNoTeam = sessionStorage.getItem('teamId') === null
						|| sessionStorage.getItem('teamId') === "undefined";
					ctx.team = teams;
					ctx.loadPartials({
						header: './templates/common/header.hbs',
						footer: './templates/common/footer.hbs',
						team: './templates/catalog/team.hbs'
					}).then(function () {
						this.partial('./templates/catalog/teamCatalog.hbs');
					})
				});
		}
		
		function displayHome(ctx) {
			ctx.loggedIn = sessionStorage.getItem('authtoken') !== null;
			ctx.username = sessionStorage.getItem('username');
			if (ctx.loggedIn) {
				ctx.hasTeam = sessionStorage.getItem('teamId');
			}
			ctx.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
			}).then(function () {
				this.partial('./templates/home/home.hbs');
			})
		}
	});
	app.run();
});