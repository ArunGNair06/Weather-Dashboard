document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([9.6922, 76.5523], 13);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    
    function getBaseRadius(rainfall) {
        if (rainfall > 204.4) return 2000;   
        if (rainfall >= 115.6) return 1500;
        if (rainfall >= 64.5) return 1000;
        if (rainfall >= 15.6) return 500;
        if (rainfall >= 2.5) return 100;
        return 0; 
    }

    
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

    
    fetch('Meenachil_RainGauge_Locations/Meenachil_RainGauge_Locations_with_dummy.geojson')
        .then(response => response.json())
        .then(geojsonData => {
            L.geoJson(geojsonData, {
                pointToLayer: function (feature, latlng) {
                    
                    let marker = L.marker(latlng);

                    let rainfall = parseFloat(feature.properties.Rainfall);
                    let baseRadius = getBaseRadius(rainfall);
                    addStaticCircle(latlng, baseRadius);

                    return marker;
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', function () {
                        var popupContent = '<p>Location: ' + feature.properties.Location + '</p>' +
                                           '<p>Rainfall: ' + feature.properties.Rainfall + ' mm</p>' +
                                           '<p>Humidity: ' + feature.properties.Humidity + '</p>' +
                                           '<p>River Water Level: ' + feature.properties["River Water Level"] + '</p>';
                        layer.bindPopup(popupContent).openPopup();
                    });
                }
            }).addTo(map);
        })
        .catch(err => console.error('Error loading GeoJSON:', err));
});
