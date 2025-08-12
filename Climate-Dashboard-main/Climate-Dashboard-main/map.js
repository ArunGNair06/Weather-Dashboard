document.addEventListener('DOMContentLoaded', function () {
    // Initialize map
    var map = L.map('map').setView([9.6922, 76.5523], 11);

    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Your OpenWeatherMap API key
    const API_KEY = "b25bd534d5f8d89040e648e49031c2cf";

    // Get circle radius from rainfall
    function getBaseRadius(rainfall) {
        if (rainfall > 204.4) return 2000;
        if (rainfall >= 115.6) return 1500;
        if (rainfall >= 64.5) return 1000;
        if (rainfall >= 15.6) return 500;
        if (rainfall >= 2.5) return 100;
        return 0;
    }

    // Add static circle
    function addStaticCircle(latlng, baseRadius) {
        if (baseRadius === 0) return;
        L.circle(latlng, {
            radius: baseRadius,
            color: 'blue',
            opacity: 1,
            weight: 1,
            fillOpacity: 0.6,
            fillColor: 'blue'
        }).addTo(map);
    }

    // Load GeoJSON and fetch live weather
    fetch('Meenachil_RainGauge_Locations/Meenachil_RainGauge_Locations.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJson(geojsonData, {
                pointToLayer: function (feature, latlng) {
                    let marker = L.marker(latlng);

                    // Get live weather for each location
                    let lat = latlng.lat;
                    let lon = latlng.lng;
                    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

                    fetch(apiUrl)
                        .then(res => res.json())
                        .then(data => {
                            let humidity = data.main.humidity;
                            let rainfall = 0;

                            if (data.rain) {
                                rainfall = data.rain['1h'] || data.rain['3h'] || 0;
                            }

                            // Add circle based on rainfall
                            let baseRadius = getBaseRadius(rainfall);
                            addStaticCircle(latlng, baseRadius);

                            // Popup with live data
                            let popupContent = `
                                <p><strong>${feature.properties.Location}</strong></p>
                                <p>Rainfall: ${rainfall} mm</p>
                                <p>Humidity: ${humidity}%</p>
                                <p>River Water Level: Live data not available</p>
                            `;
                            marker.bindPopup(popupContent);
                        })
                        .catch(err => console.error("Weather fetch error:", err));

                    return marker;
                }
            }).addTo(map);
        })
        .catch(err => console.error('GeoJSON load error:', err));
});
