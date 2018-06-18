function attachEvents() {
	const baseUrl = "https://judgetests.firebaseio.com/";
	const locations = $('#location');
	const submits = $('#submit');
	const currents = $('#current');
	const upcomings = $('#upcoming');
	const forecasts = $('#forecast');
	
	submits.click(getWeather);
	
	function request(endUrl) {
		return $.ajax({
			url: `${baseUrl}${endUrl}`
		});
	}
	
	async function getWeather() {
		try {
			let data = await request("locations.json");
			
			for (let location of data) {
				if (location.name === locations.val()) {
					try {
						let [today, upcoming] = await Promise.all([request(`forecast/today/${location.code}.json`), request(`forecast/upcoming/${location.code}.json`)]);
						let icons = {
							['Sunny']: "&#x2600;",
							['Partly sunny']: "&#x26C5;",
							['Overcast']: "&#x2601;",
							['Rain']: "&#x2614;",
							['Degrees']: "&#176;"
						};
						$('#current.label').empty();
						currents
							.append($(`<span class="condition symbol">${icons[today.forecast.condition]}</span>`))
							.append($('<span class="condition">')
								.append($(`<span class="forecast-data">${today.name}</span>`))
								.append($(`<span class="forecast-data">${today.forecast.low}${icons.Degrees}/${today.forecast.high}${icons.Degrees}</span>`))
								.append($(`<span class="forecast-data">${today.forecast.condition}</span>`)));
						
						$('#upcoming.label').empty();
						for (let upcomingForecast of upcoming.forecast) {
							upcomings
								.append($('<span class="upcoming">')
									.append($(`<span class="symbol">${icons[upcomingForecast.condition]}</span>`))
									.append($(`<span class="forecast-data">${upcomingForecast.low}${icons.Degrees}/${upcomingForecast.high}${icons.Degrees}</span>`))
									.append($(`<span class="forecast-data">${upcomingForecast.condition}</span>`)));
						}
						forecasts.css("display", "block");
					} catch (err) {
						displayError();
					}
					break;
				}
			}
			locations.val('');
		} catch (err) {
			displayError();
		}
		
		function displayError(err) {
			forecasts.html("Error");
			forecasts.css("display", "block");
		}
	}
	
}