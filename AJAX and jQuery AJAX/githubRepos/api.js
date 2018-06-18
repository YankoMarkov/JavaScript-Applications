function loadRepos() {
	$("#repos").text('Loading...');
	$('#btnLoad').prop('disabled', true);
	let req = {
		url: `https://api.github.com/users/${$("#username").val()}/repos`,
		success: displayRepos,
		error: displayError,
		complete: () => $('#btnLoad').prop('disabled', false)
	};
	$.ajax(req);
	$("#username").val('');
	
	function displayRepos(repos) {
		$("#repos").empty();
		for (let repo of repos) {
			$('#repos').append($(`<li><a href="${repo.html_url}" target="_blank">${repo.name}</a></li>`));
		}
	}
	
	function displayError() {
		$("#repos").empty();
		$('#repos').append($("<li>Error</li>"));
	}
}