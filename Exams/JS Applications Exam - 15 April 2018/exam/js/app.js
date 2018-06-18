$(() => {
	let app = Sammy('#container', function () {
		this.use('Handlebars', 'hbs');
		
		this.get('index.html', function (ctx) {
			ctx.redirect('#/home');
		});
		
		this.get('#/home', function (ctx) {
			if (auth.isAuth()) {
				let total = 0;
				let productCount = 0;
				let userId = sessionStorage.getItem('userId');
				ctx.isAuthor = auth.isAuth();
				ctx.username = sessionStorage.getItem('username');
				service.getReceipt(userId)
					.then(function (receiptData) {
						console.log(receiptData);
						let receipt;
						
						if (receiptData.length === 0) {
							service.createReceipt()
								.then(function (dataReceipt) {
									receipt = dataReceipt;
									service.saveReceiptId(dataReceipt._id);
									ctx.total = total;
									ctx.productCount = productCount;
									ctx.receiptId = dataReceipt._id;
									
									loadReceiptView(ctx);
								}).cache(notify.handleError);
						} else {
							receipt = receiptData[0];
							service.saveReceiptId(receipt._id);
							service.getEntriesByReceiptId(receipt._id)
								.then(function (entries) {
									entries.forEach(e => {
										e.subTotal = (Number(e.qty) * Number(e.price)).toFixed(2);
										total += Number(e.subTotal);
										productCount++;
									});
									ctx.total = total.toFixed(2);
									ctx.productCount = productCount;
									ctx.receiptId = receipt._id;
									ctx.entries = entries;
									
									loadReceiptView(ctx);
								}).cache(notify.handleError);
						}
					});
			} else {
				this.loadPartials({
					header: './templates/common/header.hbs',
					footer: './templates/common/footer.hbs',
					login: './templates/common/login.hbs',
					register: './templates/common/register.hbs',
				}).then(function () {
					this.partial('./templates/welcomePage.hbs');
				}).cache(notify.handleError);
			}
		});
		
		this.post('#/create/entry', function (ctx) {
			let type = ctx.params.type;
			let quantity = Number(ctx.params.qty);
			let price = Number(ctx.params.price);
			let receiptId = sessionStorage.getItem('receiptId');
			
			if (type === "" || type === null) {
				notify.showError("The type of the product shouldn`t be empty!")
			} else if (quantity === "" || isNaN(quantity)) {
				notify.showError("The quantity should be a number!")
			} else if (price === "" || isNaN(price)) {
				notify.showError("The price should be a number!")
			} else {
				service.addEntry(type, quantity, price, receiptId)
					.then(function (entryData) {
						auth.showInfo("Entry added");
						ctx.redirect('#/home');
					}).cache(notify.handleError);
			}
		});
		
		this.post('#/login', function (ctx) {
			let user = ctx.params.username;
			let pass = ctx.params.password;
			
			if (user.length < 5) {
				notify.showError("Username shouldn`t be less than 5 characters!")
			} else if (pass === '') {
				notify.showError("Password shouldn`t be empty!")
			} else {
				auth.login(user, pass)
					.then(function (userData) {
						auth.saveSession(userData);
						notify.showInfo("Login successful.");
						ctx.redirect('#/home');
					}).cache(notify.handleError);
			}
		});
		
		this.post('#/register', function (ctx) {
			let user = ctx.params.username;
			let pass = ctx.params.password;
			let repeatPass = ctx.params.repeatPass;
			
			if (user.length < 5) {
				notify.showError("Username shouldn`t be less than 5 characters!")
			} else if (pass === '') {
				notify.showError("Password shouldn`t be empty!")
			} else if (pass !== repeatPass) {
				notify.showError("Passwords mismatch!")
			} else {
				auth.register(user, pass)
					.then(function (userData) {
						auth.saveSession(userData);
						notify.showInfo("User registration successful.");
						ctx.redirect('#/home');
					})
			}
		});
		
		this.get('#/delete/:id', function (ctx) {
			let id = ctx.params.id;
			service.deleteEntry(id)
				.then(function (data) {
					notify.showInfo("Entry removed");
					ctx.redirect('#/home');
				}).cache(notify.handleError);
		});
		
		this.get('#/logout', function (ctx) {
			auth.logout()
				.then(function () {
					sessionStorage.clear();
					notify.showInfo("Logout successful.");
					ctx.redirect('#/home');
				}).catch(notify.handleError);
		});
		
		this.get('#/overview', function (ctx) {
			ctx.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
			}).then(function () {
				this.partial('./templates/allReceipt.hbs');
			}).cache(notify.handleError);
		});
		
		function loadReceiptView(ctx) {
			ctx.loadPartials({
				header: './templates/common/header.hbs',
				footer: './templates/common/footer.hbs',
				listEntry: './templates/common/listEntry.hbs',
				createEntry: './templates/common/createEntry.hbs',
				commitReceipt: './templates/common/commitReceipt.hbs',
				entry: './templates/common/entry.hbs',
			}).then(function () {
				this.partial('./templates/createReceipt.hbs');
			}).cache(notify.handleError);
		}
	});
	app.run();
});