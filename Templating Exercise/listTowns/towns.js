$(() => {
	
	const templates = {};
	
	const context = {
		towns: []
	};
	
	const root = $('#root');
	
	loadData();
	attachHandler();
	
	function loadData() {
		let towns = $('#towns').val();
		towns = towns.split(", ").map(e => {
			return {name: e}
		});
		console.log(towns);
		context.towns = towns;
	}
	
	async function loadTemplates() {
		const [townSource, listSource] = await Promise.all([
			$.get('./templates/town.html'),
			$.get('./templates/townsList.html')
		]);
		Handlebars.registerPartial('town', townSource);
		templates.list = Handlebars.compile(listSource);
		renderList();
	}
	
	function renderList() {
		let ul = $('<ul>');
		ul.append(templates.list(context));
		root.html(ul);
	}
	
	function attachHandler() {
		$('#btnLoadTowns').click(loadTemplates);
	}
});