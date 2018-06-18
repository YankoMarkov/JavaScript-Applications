handlers.contacts = function (ctx) {
	if (!auth.isAuthed()) {
		this.redirect('#');
	} else {
		ctx.loggedIn = true;
	}
	$.get('data.json').then(data => {
		ctx.contacts = data;
		ctx.selected = null;
		
		ctx.loadPartials({
			header: './templates/header.hbs',
			footer: './templates/footer.hbs',
			contact: './templates/contact.hbs',
			contactsList: './templates/contactsList.hbs',
			details: './templates/details.hbs',
		}).then(function () {
			ctx.partials = this.partials;
			render();
		});
	});
	
	function render() {
		ctx.partial('./templates/contacts.hbs')
			.then(attachEventHandlers);
	}
	
	function attachEventHandlers() {
		$('.contact').click(e => {
			let index = $(e.target).closest('.contact').attr('data-id');
			ctx.contacts.forEach(c => c.active = false);
			ctx.contacts[index].active = true;
			ctx.selected = ctx.contacts[index];
			render();
		});
	}
};