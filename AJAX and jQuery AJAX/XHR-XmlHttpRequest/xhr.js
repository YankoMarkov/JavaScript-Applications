function loadRepos() {
	let req = new XMLHttpRequest();
	req.addEventListener('load', function () {
		if (req.status === 404) {
			document.getElementById("res").textContent = "Error - Not Found";
			return;
		}
		let repos = JSON.parse(req.responseText);
		let output = document.getElementById("res");
		output.innerHTML = '<ul>';
		for (let repo of repos) {
			output.innerHTML += `<li>${repo.name}</li>`;
		}
		output.innerHTML += '</ul>';
	});
	req.open("GET", "https://api.github.com/users/testnakov/repos", true);
	req.send();
}