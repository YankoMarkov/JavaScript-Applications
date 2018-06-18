$(() => {
	const templates = {};
	
	const context = {
		cats: []
	};
	
	loadData();
	loadTemplates();
	
	function loadData() {
		context.cats = window.cats;
		console.log(context.cats);
	}
	
	async function loadTemplates() {
		const [catSource, listSource] = await Promise.all([
			$.get('./templates/cat.html'),
			$.get('./templates/catList.html')
		]);
		Handlebars.registerPartial('cat', catSource);
		templates.list = Handlebars.compile(listSource);
		renderCatTemplate();
	}
	
	function renderCatTemplate() {
		let cats = $('#allCats');
		cats.html(templates.list(context));
		console.log(templates.list(context));
		attachHandler();
	}
	
	function attachHandler() {
		$('button').click(e => {
			let btn = $(e.target);
			let info = btn.next();
			let text = btn.text();
			if (text.includes('Show')) {
				btn.text(text.replace('Show', 'Hide'));
			} else {
				btn.text(text.replace('Hide', 'Show'));
			}
			info.toggle();
		});
	}
});
