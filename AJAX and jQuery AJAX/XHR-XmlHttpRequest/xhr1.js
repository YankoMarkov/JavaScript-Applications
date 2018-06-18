function loadRepos() {
	let req = new XMLHttpRequest();
	req.addEventListener('load', function () {
		let output = document.getElementById("res");
		output.textContent = this.responseText;
	});
	req.open("GET", "https://api.github.com/users/testnakov/repos", true);
	req.send();
}