function loadCommits() {
	let commits = $('#commits');
	commits.empty();
	let baseUpl = "https://api.github.com/repos/";
	let username = $('#username');
	let repo = $('#repo');
	
	$.ajax({
		url: `${baseUpl}${username.val()}/${repo.val()}/commits`,
		success: displayCommits,
		error: displayError
	});
	
	function displayCommits(data) {
		console.log(data);
		for (let obj of data) {
			commits.append($(`<li>${obj.commit.author.name}: ${obj.commit.message}</li>`));
		}
	}
	
	function displayError(err) {
		commits.append($(`<li>Error: ${err.status} (${err.statusText})</li>`));
	}
}